export const getImageUrl = (coverPath, title, dimensions = { width: 300, height: 450 }) => {
    if (!coverPath) {
        return getPlaceholderUrl(title, dimensions.width, dimensions.height);
    }

    if (coverPath.startsWith('http')) {
        return coverPath;
    }

    // If it starts with /uploads, it's a local file
    if (coverPath.startsWith('/uploads')) {
        // In development, prepend the API URL
        return process.env.NODE_ENV === 'development'
            ? `http://localhost:5000${coverPath}`
            : coverPath;
    }

    // Fallback to placeholder
    return getPlaceholderUrl(title, dimensions.width, dimensions.height);
};

export const getPlaceholderUrl = (title, width = 300, height = 450) => {
    return `/api/placeholder/${width}/${height}?text=${encodeURIComponent(title || 'No Cover')}`;
};

export const handleImageError = (event, title, dimensions = { width: 300, height: 450 }) => {
    console.error('Image load error:', event.target.src);
    event.target.onerror = null; // Prevent infinite loop
    event.target.src = getPlaceholderUrl(title, dimensions.width, dimensions.height);
};