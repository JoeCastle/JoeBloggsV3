'use client';

import Link from 'next/link';
import { PostMeta } from '@/lib/posts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faArrowRight,
    faClockRotateLeft,
    faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import utils from '../../utils/utils';

interface Props {
    posts: PostMeta[];
    currentSlug: string;
}

/**
 * Handles the next and previous navigation for a blog post.
 * @param param0
 * @returns
 */
export default function PostNavigation({ posts, currentSlug }: Props) {
    const index: number = posts.findIndex((p: PostMeta) => p.slug === currentSlug);
    if (index === -1) return null;

    const prevIndex: number = (index + 1) % posts.length;
    const nextIndex: number = (index - 1 + posts.length) % posts.length;

    const prevPost: PostMeta = posts[prevIndex];
    const nextPost: PostMeta = posts[nextIndex];

    return (
        <div className="content-width-wrapper">
            <div className="post-navigation">
                {prevPost && (
                    <Link href={`/blog/${prevPost.slug}`} className="nav-link prev-link">
                        <span className="nav-label">
                            {prevIndex === 0 ? (
                                <>
                                    <FontAwesomeIcon icon={faClockRotateLeft} /> Latest Post
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faArrowLeft} /> Previous
                                </>
                            )}
                        </span>
                        <span className="nav-title">{prevPost.title}</span>
                        <span className="nav-date">{utils.formatDate(prevPost.date)}</span>
                    </Link>
                )}

                {nextPost && (
                    <Link href={`/blog/${nextPost.slug}`} className="nav-link next-link">
                        <span className="nav-label">
                            {nextIndex === posts.length - 1 ? (
                                <>
                                    Back to the Beginning <FontAwesomeIcon icon={faArrowRotateRight} />
                                </>
                            ) : (
                                <>
                                    Next <FontAwesomeIcon icon={faArrowRight} />
                                </>
                            )}
                        </span>
                        <span className="nav-title">{nextPost.title}</span>
                        <span className="nav-date">{utils.formatDate(nextPost.date)}</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
