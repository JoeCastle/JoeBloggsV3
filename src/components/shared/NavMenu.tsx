'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '../../images/logo_cropped.png';

interface Props {
    isDarkMode: boolean;
}

/**
 * The navbar at the top of the page.
 * @param props
 * @returns
 */
export const NavMenu: React.FC<Props> = ({ isDarkMode }) => {
    return (
        <nav className={`navbar navbar-expand-lg navbar-expand-md ${isDarkMode ? 'navbar-dark' : ''}`}>
            <div className="container-fluid">
                <div className="navbar-header">
                    <Link href="/" className="navbar-brand">
                        <Image src={Logo} alt="Joseph Castle" width={169} height={32} priority={true} />
                    </Link>
                </div>
                <div className="navbar">
                    <Link href="https://joecastle.co.uk" className="navbar-portfolio-link" rel="noopener" target="_blank">
                        My Portfolio →
                    </Link>
                </div>
            </div>
        </nav>
    );
};
