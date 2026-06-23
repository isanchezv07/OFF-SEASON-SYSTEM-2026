import { calculateWinner } from '../calculateWinner';

describe('calculateWinner', () => {
  it('debería retornar blue como ganador cuando blue tiene más puntos', () => {
    const zoneResults = [
      { zone: 'zone1', blueScore: 10, redScore: 5 },
      { zone: 'zone2', blueScore: 8, redScore: 7 },
    ];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('blue');
    expect(result.blueTotal).toBe(18);
    expect(result.redTotal).toBe(12);
  });

  it('debería retornar red como ganador cuando red tiene más puntos', () => {
    const zoneResults = [
      { zone: 'zone1', blueScore: 5, redScore: 10 },
      { zone: 'zone2', blueScore: 7, redScore: 8 },
    ];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('red');
    expect(result.blueTotal).toBe(12);
    expect(result.redTotal).toBe(18);
  });

  it('debería retornar tie cuando ambos equipos tienen los mismos puntos', () => {
    const zoneResults = [
      { zone: 'zone1', blueScore: 10, redScore: 10 },
      { zone: 'zone2', blueScore: 5, redScore: 5 },
    ];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('tie');
    expect(result.blueTotal).toBe(15);
    expect(result.redTotal).toBe(15);
  });

  it('debería manejar un array vacío correctamente', () => {
    const zoneResults: Array<{ zone: string; blueScore: number; redScore: number }> = [];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('tie');
    expect(result.blueTotal).toBe(0);
    expect(result.redTotal).toBe(0);
  });

  it('debería calcular correctamente con múltiples zonas', () => {
    const zoneResults = [
      { zone: 'zone1', blueScore: 3, redScore: 2 },
      { zone: 'zone2', blueScore: 5, redScore: 7 },
      { zone: 'zone3', blueScore: 1, redScore: 1 },
      { zone: 'zone4', blueScore: 10, redScore: 8 },
    ];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('blue');
    expect(result.blueTotal).toBe(19);
    expect(result.redTotal).toBe(18);
  });

  it('debería manejar puntajes negativos correctamente', () => {
    const zoneResults = [
      { zone: 'zone1', blueScore: -5, redScore: 10 },
      { zone: 'zone2', blueScore: 15, redScore: -2 },
    ];

    const result = calculateWinner(zoneResults);

    expect(result.winner).toBe('blue');
    expect(result.blueTotal).toBe(10);
    expect(result.redTotal).toBe(8);
  });
});
