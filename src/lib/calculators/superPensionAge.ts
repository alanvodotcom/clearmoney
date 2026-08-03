/**
 * Rough AU preservation age by year of birth (simplified bands).
 * Age Pension age: 67 for people born on/after 1 Jan 1957 (current standard).
 */
export type SuperPensionAgeInputs = {
  /** Birth year, e.g. 1985. */
  birthYear: number;
  /** Birth month 1–12. */
  birthMonth: number;
};

export type SuperPensionAgeResult = {
  preservationAge: number;
  agePensionAge: number;
  preservationDateLabel: string;
  agePensionDateLabel: string;
};

function preservationAgeForBirthYear(year: number): number {
  if (year < 1960) return 55;
  if (year === 1960) return 56;
  if (year === 1961) return 57;
  if (year === 1962) return 58;
  if (year === 1963) return 59;
  return 60; // born 1964 or later
}

function formatMonthYear(year: number, month: number): string {
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = Math.min(12, Math.max(1, month));
  return `${names[m - 1]} ${year}`;
}

export function superAndPensionAge(
  inputs: SuperPensionAgeInputs,
): SuperPensionAgeResult {
  const birthYear = Math.max(1920, Math.min(2010, inputs.birthYear));
  const birthMonth = Math.min(12, Math.max(1, inputs.birthMonth));
  const preservationAge = preservationAgeForBirthYear(birthYear);
  // Simplified: Age Pension age 67 for cohorts from mid-1950s onward
  const agePensionAge = birthYear >= 1957 ? 67 : birthYear >= 1952 ? 66.5 : 65;

  const preservYear = birthYear + Math.floor(preservationAge);
  const preservMonth =
    birthMonth + Math.round((preservationAge % 1) * 12);
  let py = preservYear;
  let pm = preservMonth;
  if (pm > 12) {
    py += 1;
    pm -= 12;
  }

  const pensionWhole = Math.floor(agePensionAge);
  const pensionFracMonths = Math.round((agePensionAge % 1) * 12);
  let pensionYear = birthYear + pensionWhole;
  let pensionMonth = birthMonth + pensionFracMonths;
  if (pensionMonth > 12) {
    pensionYear += 1;
    pensionMonth -= 12;
  }

  return {
    preservationAge,
    agePensionAge,
    preservationDateLabel: formatMonthYear(py, pm),
    agePensionDateLabel: formatMonthYear(pensionYear, pensionMonth),
  };
}
