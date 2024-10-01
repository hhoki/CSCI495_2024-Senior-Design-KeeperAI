// script.js
import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleDropdown = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleClickOutside = (event) => {
        if (activeIndex !== null) {
            setActiveIndex(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeIndex]);

    return (
        <nav>
            <ul>
                {[...Array(5)].map((_, index) => (
                    <li key={index} className="nav-item" onClick={(e) => { e.stopPropagation(); toggleDropdown(index); }}>
                        Item {index + 1}
                        {activeIndex === index && (
                            <div className="dropdown-menu" style={{ display: 'block' }}>
                                Dropdown Content
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;

