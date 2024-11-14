import React from 'react';
import '../styles/RecomendationSkeleton.css';

const RecommendationSkeleton = () => {
    return (
        <div className="recommendation-card skeleton">
            <div className="skeleton-cover pulse"></div>
            <div className="skeleton-info">
                <div className="skeleton-title pulse"></div>
                <div className="skeleton-author pulse"></div>
                <div className="skeleton-reason pulse"></div>
                <div className="skeleton-similar pulse"></div>
                <div className="skeleton-button pulse"></div>
            </div>
        </div>
    );
};

export default RecommendationSkeleton;