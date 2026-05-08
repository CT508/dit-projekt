export const euVatRates: Record<string, { country: string; rate: number }> = {
  AT: { country: "Austria", rate: 0.20 },
  BE: { country: "Belgium", rate: 0.21 },
  BG: { country: "Bulgaria", rate: 0.20 },
  HR: { country: "Croatia", rate: 0.25 },
  CY: { country: "Cyprus", rate: 0.19 },
  CZ: { country: "Czech Republic", rate: 0.21 },
  DK: { country: "Denmark", rate: 0.25 },
  EE: { country: "Estonia", rate: 0.24 },
  FI: { country: "Finland", rate: 0.255 },
  FR: { country: "France", rate: 0.20 },
  DE: { country: "Germany", rate: 0.19 },
  GR: { country: "Greece", rate: 0.24 },
  HU: { country: "Hungary", rate: 0.27 },
  IE: { country: "Ireland", rate: 0.23 },
  IT: { country: "Italy", rate: 0.22 },
  LV: { country: "Latvia", rate: 0.21 },
  LT: { country: "Lithuania", rate: 0.21 },
  LU: { country: "Luxembourg", rate: 0.17 },
  MT: { country: "Malta", rate: 0.18 },
  NL: { country: "Netherlands", rate: 0.21 },
  PL: { country: "Poland", rate: 0.23 },
  PT: { country: "Portugal", rate: 0.23 },
  RO: { country: "Romania", rate: 0.21 },
  SK: { country: "Slovakia", rate: 0.23 },
  SI: { country: "Slovenia", rate: 0.22 },
  ES: { country: "Spain", rate: 0.21 },
  SE: { country: "Sweden", rate: 0.25 }
};

export function getVatRate(countryCode: string) {
  return euVatRates[countryCode]?.rate ?? 0;
}

export function getCountryName(countryCode: string) {
  return euVatRates[countryCode]?.country ?? countryCode;
}

export function calculateVatPrices(price: number, countryCode: string, pricesIncludeVat: boolean) {
  const vatRate = getVatRate(countryCode);
  const priceExVat = pricesIncludeVat ? price / (1 + vatRate) : price;
  const priceIncVat = pricesIncludeVat ? price : price * (1 + vatRate);

  return {
    vatRate,
    priceExVat,
    priceIncVat
  };
}
