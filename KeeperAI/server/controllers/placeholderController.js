exports.generatePlaceholder = async (req, res) => {
    try {
        const width = parseInt(req.params.width) || 300;
        const height = parseInt(req.params.height) || 450;
        const text = req.query.text || 'No Cover';
        const bgColor = req.query.bg || '#e0e0e0';
        const textColor = req.query.color || '#333333'; // Darker text for better contrast

        const svg = `
      <svg 
        width="${width}" 
        height="${height}" 
        xmlns="http://www.w3.org/2000/svg"
        style="background: ${bgColor}"
      >
        <defs>
          <pattern 
            id="stripe" 
            width="15" 
            height="15" 
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="15" 
              stroke="${textColor}" 
              stroke-width="1" 
              stroke-opacity="0.1"
            />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#stripe)"/>
        <rect width="100%" height="100%" fill="none" stroke="${textColor}" stroke-opacity="0.2"/>
        
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
          .placeholder-text {
            font-family: 'Outfit', system-ui, sans-serif;
            font-weight: 600;
            font-size: ${Math.min(Math.max(width / 15, 16), 24)}px;
            text-rendering: optimizeLegibility;
            shape-rendering: geometricPrecision;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        </style>

        <g>
          <text 
            x="50%" 
            y="50%" 
            class="placeholder-text"
            fill="${textColor}"
            text-anchor="middle"
            dominant-baseline="middle"
          >${text}</text>
        </g>
      </svg>
    `;

        res.set({
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=31536000',
            'X-Content-Type-Options': 'nosniff',
        });

        res.send(svg);

    } catch (error) {
        console.error('Error generating placeholder:', error);
        res.status(500).json({ message: 'Error generating placeholder image' });
    }
};