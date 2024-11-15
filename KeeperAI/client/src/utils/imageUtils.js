export const getImageUrl = (coverPath, title, dimensions = { width: 300, height: 450 }) => {
    if (!coverPath) {
        return getPlaceholderUrl(title, dimensions.width, dimensions.height);
    }

    if (coverPath.startsWith('http')) {
        // For Google Books URLs, ensure they're HTTPS and have the right zoom
        if (coverPath.includes('books.google.com')) {
            return coverPath
                .replace('http://', 'https://')
                .replace('zoom=1', 'zoom=3')
                .replace('&edge=curl', '');
        }
        return coverPath;
    }

    // For local files (from uploads directory)
    if (coverPath.startsWith('/uploads')) {
        return process.env.NODE_ENV === 'development'
            ? `http://localhost:5000${coverPath}`
            : coverPath;
    }

    // Fallback to placeholder
    return getPlaceholderUrl(title, dimensions.width, dimensions.height);
};

export const getPlaceholderUrl = (title, width = 300, height = 450) => {
    // For development, use the full URL
    const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'
        : '';

    return `${baseUrl}/placeholder/${width}/${height}?text=${encodeURIComponent(title || 'No Cover')}`;
};

export const handleImageError = (event, title, dimensions = { width: 300, height: 450 }) => {
    console.error('Image load error:', event.target.src);
    event.target.onerror = null; // Prevent infinite loop

    // Try Google Books URL first if it failed
    if (event.target.src.includes('books.google.com')) {
        // If Google Books image failed, fall back to placeholder
        event.target.src = getPlaceholderUrl(title, dimensions.width, dimensions.height);
    } else {
        // If placeholder failed, show a generic error image or try Google Books
        event.target.src = getPlaceholderUrl('Error Loading Image', dimensions.width, dimensions.height);
    }
};