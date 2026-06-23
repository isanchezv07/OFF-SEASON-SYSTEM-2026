interface ZoneResult {
    zone: string;
    blueScore: number;
    redScore: number;
  }
  
  export const calculateWinner = (zoneResults: ZoneResult[]) => {
    let blueTotal = 0;
    let redTotal = 0;
    
    // Sum up all scores
    zoneResults.forEach(result => {
      blueTotal += result.blueScore;
      redTotal += result.redScore;
    });
    
    // Determine winner
    let winner: 'blue' | 'red' | 'tie' = 'tie';
    
    if (blueTotal > redTotal) {
      winner = 'blue';
    } else if (redTotal > blueTotal) {
      winner = 'red';
    }
    
    return {
      winner,
      blueTotal,
      redTotal
    };
  };