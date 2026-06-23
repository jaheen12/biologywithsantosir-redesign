import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import type { Post } from '../hooks/usePosts';
import Badge from './ui/Badge';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <article className="bg-surface border border-border rounded-xl p-5 hover:border-primary hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex gap-2 mb-3">
          <Badge variant={post.academic_level}>{post.academic_level}</Badge>
          <Badge variant="default" className="bg-surface-alt border border-border text-text-secondary capitalize">
            {post.topic_id.replace('-', ' ')}
          </Badge>
        </div>
        
        <Link to={`/topics/${post.topic_id}/${post.slug}`}>
          <h3 className="text-lg font-sans font-bold text-text-primary mb-2 line-clamp-2 hover:text-primary transition-colors duration-200">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3 font-sans">
          {post.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-text-muted border-t border-border/50 pt-3 mt-auto font-sans">
        <span className="flex items-center gap-1">
          <User size={14} />
          {post.author}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {post.read_time} min read
        </span>
      </div>
    </article>
  );
};

export default PostCard;
