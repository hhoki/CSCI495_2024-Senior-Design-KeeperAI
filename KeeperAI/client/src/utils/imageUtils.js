export const getPlaceholderUrl = (title, width = 300, height = 450) => {
    return `/api/placeholder/${width}/${height}?text=${encodeURIComponent(title || 'No Cover')}`;
};


export const getImageUrl = (coverPath, title, dimensions = { width: 200, height: 300 }) => {
    if (!coverPath) {
        return getPlaceholderUrl(title, dimensions.width, dimensions.height);
    }

    if (coverPath.startsWith('http')) {
        return coverPath;
    }

    // If it's a local path (from our API), return as is
    return coverPath;
};


export const handleImageError = (event, title, dimensions = { width: 200, height: 300 }) => {
    event.target.onerror = null; // Prevent infinite loop
    event.target.src = getPlaceholderUrl(title, dimensions.width, dimensions.height);
};