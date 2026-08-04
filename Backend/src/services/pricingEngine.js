/**
 * Enterprise Pricing Engine Service
 *
 * Implements a strategy-pattern rule engine that evaluates active pricing rules
 * against time slots, courts, arenas, and dates using an enterprise priority chain:
 *
 *   1. Holiday Overrides
 *   2. Custom Rules (if configured)
 *   3. Weekend Pricing
 *   4. Peak Hour Surcharge
 *   5. Standard Base Price (Resolution: Court Override > Slot Configured Price > Arena Price Per Hour)
 */

const timeToMinutes = (t) => {
  if (!t) return 0;
  const parts = String(t).trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  let finalH = h;
  if (parts.length > 1) {
    const period = parts[1].toUpperCase();
    if (period === 'PM' && h !== 12) finalH += 12;
    if (period === 'AM' && h === 12) finalH = 0;
  }
  return finalH * 60 + (m || 0);
};

const DAY_MAP = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
};

/**
 * Calculates pricing for a given court slot request
 *
 * @param {Object} params
 * @param {Object} params.arena Arena document or object
 * @param {Object} [params.court] Optional court document
 * @param {String} params.date Date string (YYYY-MM-DD)
 * @param {String} params.timeSlot Time slot string (e.g. "06:00 PM - 07:00 PM" or "18:00")
 * @param {Object} [params.slot] Optional configured CourtSlot object
 * @returns {Object} Structured pricing calculation result
 */
function evaluatePricing({ arena, court, date, timeSlot, slot }) {
  const arenaObj = arena || {};
  const priceConfig = arenaObj.priceConfig || {};

  // 1. Resolve Base Price (Court Level Override > Slot Configured Price > Arena Price Per Hour)
  let basePrice = Number(arenaObj.pricePerHour || 0);
  if (slot && typeof slot.price === 'number' && slot.price > 0) {
    basePrice = Number(slot.price);
  }
  if (court && typeof court.customPrice === 'number' && court.customPrice > 0) {
    basePrice = Number(court.customPrice);
  }

  // Parse Date & Time — use noon UTC to avoid off-by-one day in timezones east of UTC
  const dateObj = date ? new Date(date + 'T12:00:00Z') : new Date();
  const dayOfWeek = DAY_MAP[dateObj.getUTCDay()] || 'Mon';

  let slotStartTime = '';
  if (slot && slot.startTime) {
    slotStartTime = slot.startTime;
  } else if (timeSlot) {
    const rawStart = timeSlot.split('-')[0].trim();
    slotStartTime = rawStart;
  }

  const slotMinutes = timeToMinutes(slotStartTime);

  // Default Result
  let pricingType = 'normal';
  let pricingRuleId = 'RULE_BASE';
  let pricingRuleName = 'Standard Base Rate';
  let peakSurcharge = 0;
  let finalPrice = basePrice;

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIORITY CHAIN EVALUATION
  // ─────────────────────────────────────────────────────────────────────────────

  // Priority 1: Holiday Overrides
  const dateStr = dateObj.toISOString().slice(0, 10);
  const holidays = Array.isArray(priceConfig.holidayOverrides) ? priceConfig.holidayOverrides : [];
  const activeHoliday = holidays.find(h => h.startDate <= dateStr && h.endDate >= dateStr);

  if (activeHoliday) {
    pricingType = 'holiday';
    pricingRuleId = activeHoliday.id || `HOLIDAY_${activeHoliday.name}`;
    pricingRuleName = activeHoliday.name || 'Holiday Special';
    const holidayRate = slot?.slotClass === 'prime' ? activeHoliday.primeRate : activeHoliday.nonPrimeRate;
    if (typeof holidayRate === 'number' && holidayRate > 0) {
      finalPrice = holidayRate;
      peakSurcharge = Math.max(0, finalPrice - basePrice);
    }
  } 
  // Priority 2: Weekend Surcharge
  else if (priceConfig.weekendEnabled && (dayOfWeek === 'Fri' || dayOfWeek === 'Sat')) {
    pricingType = 'weekend';
    pricingRuleId = 'RULE_WEEKEND';
    pricingRuleName = 'Weekend Rate';
    
    // Additive surcharge vs fixed weekend price
    const weekendAdd = Number(priceConfig.weekendSurcharge || 0);
    const fixedWeekend = Number(priceConfig.weekendPrice || 0);
    
    if (weekendAdd > 0) {
      peakSurcharge = weekendAdd;
      finalPrice = basePrice + peakSurcharge;
    } else if (fixedWeekend > 0) {
      finalPrice = fixedWeekend;
      peakSurcharge = Math.max(0, finalPrice - basePrice);
    }
  } 
  // Priority 3: Peak Hour Surcharge
  else if (priceConfig.peakEnabled) {
    const peakDays = Array.isArray(priceConfig.peakDays) && priceConfig.peakDays.length > 0
      ? priceConfig.peakDays
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isPeakDay = peakDays.includes(dayOfWeek);
    const peakStartMin = timeToMinutes(priceConfig.peakStart || '17:00');
    const peakEndMin = timeToMinutes(priceConfig.peakEnd || '22:00');

    const isPeakTime = slotMinutes >= peakStartMin && slotMinutes < peakEndMin;

    if (isPeakDay && isPeakTime) {
      pricingType = 'peak';
      pricingRuleId = 'RULE_PEAK_SURCHARGE';
      pricingRuleName = 'Evening Peak Hour';

      const peakSurch = Number(priceConfig.peakSurcharge || 0);
      const fixedPeak = Number(priceConfig.peakPrice || 0);

      if (peakSurch > 0) {
        peakSurcharge = peakSurch;
        finalPrice = basePrice + peakSurcharge;
      } else if (fixedPeak > 0) {
        // If fixed peak price configured, calculate surcharge as difference over base
        finalPrice = fixedPeak;
        peakSurcharge = Math.max(0, fixedPeak - basePrice);
      }
    }
  }

  return {
    price: Number(finalPrice.toFixed(3)),
    pricing: {
      type: pricingType,
      ruleId: pricingRuleId,
      ruleName: pricingRuleName,
      basePrice: Number(basePrice.toFixed(3)),
      peakSurcharge: Number(peakSurcharge.toFixed(3)),
      finalPrice: Number(finalPrice.toFixed(3)),
      currency: 'OMR',
      calculatedAt: new Date().toISOString(),
    },
  };
}

module.exports = { evaluatePricing };
