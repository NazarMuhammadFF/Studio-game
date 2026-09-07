/** Existing sample member palettes; appearance only, never roles or permissions. */
export function getColleaguePalette(name: string) {
        // Custom avatar palette for present colleague
        const isAlex = name.includes('Alex');
        const isKenji = name.includes('Kenji');
        const isClara = name.includes('Clara');
        const isMaya = name.includes('Maya');
        const isLucas = name.includes('Lucas');
        const isJulian = name.includes('Julian');
        const isElena = name.includes('Elena');
        const isTaro = name.includes('Taro');
        let shirtColor = '#2563eb';
        let skinColor = '#f5d0b5';
        let hairColor = '#1e293b';

        if (isAlex) {
          shirtColor = '#2563eb';
          skinColor = '#f5d0b5';
          hairColor = '#1e293b';
        } else if (isKenji) {
          shirtColor = '#ec4899';
          skinColor = '#fcd34d';
          hairColor = '#0f172a';
        } else if (isClara) {
          shirtColor = '#14b8a6';
          skinColor = '#fed7aa';
          hairColor = '#92400e';
        } else if (isMaya) {
          shirtColor = '#059669';
          skinColor = '#fed7aa';
          hairColor = '#0f172a';
        } else if (isLucas) {
          shirtColor = '#0284c7';
          skinColor = '#f5d0b5';
          hairColor = '#1e293b';
        } else if (isJulian) {
          shirtColor = '#7c3aed';
          skinColor = '#fed7aa';
          hairColor = '#1e1b4b';
        } else if (isElena) {
          shirtColor = '#d946ef';
          skinColor = '#f5d0b5';
          hairColor = '#78350f';
        } else if (isTaro) {
          shirtColor = '#0284c7';
          skinColor = '#fcd34d';
          hairColor = '#0f172a';
        } else {
          shirtColor = '#9333ea';
          skinColor = '#fcd34d';
          hairColor = '#374151';
        }


  return { shirtColor, skinColor, hairColor };
}
