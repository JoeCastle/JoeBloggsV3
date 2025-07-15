"use client";

import { useIsMobileWidth } from "@/hooks/useIsMobileWidth";
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    RedditShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    RedditIcon,
    EmailIcon,
    WhatsappShareButton,
    WhatsappIcon,
} from "next-share";
import { useEffect, useState } from "react";

interface ShareButtonsProps {
    title: string;
    url: string;
}

/**
 * Social media share buttons on the blog post page.
 * @param props title and url of the blog post.
 * @returns 
 */
const ShareButtons: React.FC<ShareButtonsProps> = (props: ShareButtonsProps) => {
    const { title, url } = props;
    const [canShare, setCanShare] = useState<boolean>(false);

    const isMobileWidth: boolean = useIsMobileWidth();
    const iconSize: number = isMobileWidth ? 32 : 44;

    useEffect(() => {
        const isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const canUseWebShare: boolean = typeof navigator !== "undefined" && !!navigator.share;
        setCanShare(isMobile && canUseWebShare);
    }, []);

    const handleNativeShare = async (): Promise<void> => {
        try {
            await navigator.share({ title, url });
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="content-width-wrapper">
            <div className="share-buttons">
                <span className="share-label">Share this post:</span>
                <div className="share-btn-row">
                    {canShare ? (
                        <button
                            onClick={handleNativeShare}
                            className="share-btn"
                        >
                            Share
                        </button>
                    ) : (
                        <>
                            <FacebookShareButton url={url} quote={title}>
                                <FacebookIcon size={iconSize} round />
                            </FacebookShareButton>
                            <TwitterShareButton url={url} title={title}>
                                <TwitterIcon size={iconSize} round />
                            </TwitterShareButton>
                            <LinkedinShareButton url={url} title={title}>
                                <LinkedinIcon size={iconSize} round />
                            </LinkedinShareButton>
                            <RedditShareButton url={url} title={title}>
                                <RedditIcon size={iconSize} round />
                            </RedditShareButton>
                            <EmailShareButton url={url} subject={title}>
                                <EmailIcon size={iconSize} round />
                            </EmailShareButton>
                            <WhatsappShareButton url={url} title={title}>
                                <WhatsappIcon size={iconSize} round />
                            </WhatsappShareButton>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareButtons;
