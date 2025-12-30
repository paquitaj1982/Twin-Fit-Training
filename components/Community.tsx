import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Image as ImageIcon, Send, ShieldAlert, BadgeCheck, Video, X } from 'lucide-react';
import { Button } from './Button';
import { Post, UserProfile } from '../types';

interface CommunityProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  user: UserProfile;
}

export const Community: React.FC<CommunityProps> = ({ posts, setPosts, user }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'General' | 'Workout' | 'Nutrition' | 'Achievement'>('All');
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  
  // Media Upload State
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<string | null>(null);

  const handlePost = () => {
    if (!newPostContent.trim() && !newPostImage && !newPostVideo) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.isTrainer ? 'twin' : 'currentUser',
      userName: user.isTrainer ? 'Twin (Coach)' : user.name,
      userAvatar: user.isTrainer ? 'https://picsum.photos/100/100?random=1' : 'https://picsum.photos/100/100?random=99',
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      videoUrl: newPostVideo || undefined,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      category: 'General',
      isTrainer: user.isTrainer,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setNewPostVideo(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const fakeUrl = URL.createObjectURL(file);
          setNewPostImage(fakeUrl);
          setNewPostVideo(null); // Clear video if image selected
      }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!user.isTrainer) return; // double check
      const file = e.target.files?.[0];
      if (file) {
          const fakeUrl = URL.createObjectURL(file);
          setNewPostVideo(fakeUrl);
          setNewPostImage(null); // Clear image if video selected
      }
  };

  const filteredPosts = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-xl py-2 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-display font-bold">COMMUNITY</h2>
            <Button variant="outline" className="py-1 px-3 text-xs h-8">GUIDELINES</Button>
          </div>

          {/* Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'General', 'Workout', 'Nutrition', 'Achievement'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-brand-red text-white shadow-red-900/20' 
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
      </div>

      {/* Create Post */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg">
        <div className="flex gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-700">
             {/* Dynamic Avatar */}
             {user.isTrainer ? (
                <img src="https://picsum.photos/100/100?random=1" alt="Twin" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center font-display font-bold text-neutral-500 text-xl">
                    {user.name.charAt(0)}
                </div>
             )}
          </div>
          <textarea 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={user.isTrainer ? "Post a workout session or tip..." : "Share your progress, ask a question..."}
            className="flex-1 bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none h-20 text-sm md:text-base"
          />
        </div>
        
        {/* Media Preview */}
        {newPostImage && (
            <div className="relative w-full h-40 bg-neutral-950 rounded-lg overflow-hidden mb-4 group">
                <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X className="w-4 h-4" /></button>
            </div>
        )}
        {newPostVideo && (
            <div className="relative w-24 h-40 bg-neutral-950 rounded-lg overflow-hidden mb-4 border border-brand-red">
                <video key={newPostVideo} src={newPostVideo} poster={newPostImage || undefined} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Video className="w-8 h-8 text-white/50" />
                </div>
                 <button onClick={() => setNewPostVideo(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full z-10"><X className="w-4 h-4" /></button>
            </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
          <div className="flex gap-2">
              {/* Image Upload */}
              <label className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-2 hover:bg-neutral-800 rounded-full">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <ImageIcon className="w-5 h-5" />
              </label>

              {/* Video Upload - TRAINER ONLY */}
              {user.isTrainer && (
                  <label className="text-neutral-400 hover:text-brand-red transition-colors cursor-pointer p-2 hover:bg-neutral-800 rounded-full relative group">
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                    <Video className="w-5 h-5" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-neutral-700">
                        Upload 9:16 Video
                    </span>
                  </label>
              )}
          </div>
          
          <button 
            onClick={handlePost}
            disabled={!newPostContent.trim() && !newPostImage && !newPostVideo}
            className="bg-white text-black px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            POST <Send className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden animate-fade-in shadow-xl">
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                  <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm text-white">{post.userName}</h3>
                    {post.isTrainer && <BadgeCheck className="w-4 h-4 text-brand-red fill-current" />}
                  </div>
                  <p className="text-xs text-neutral-500">{post.timestamp} • <span className="text-brand-red font-bold">{post.category.toUpperCase()}</span></p>
                </div>
              </div>
              <button className="text-neutral-600 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Content Text */}
            <div className="px-4 pb-3">
              <p className="text-neutral-200 text-sm leading-relaxed">{post.content}</p>
            </div>
            
            {/* Media Content */}
            {post.videoUrl && post.videoUrl.trim() !== '' && !videoErrors[post.id] ? (
                // 9:16 Video Player Container
                <div className="w-full flex justify-center bg-black">
                     <div className="relative w-full md:w-[350px] aspect-[9/16] bg-neutral-950">
                        <video 
                            key={post.videoUrl}
                            src={post.videoUrl} 
                            poster={post.imageUrl}
                            className="w-full h-full object-cover" 
                            controls 
                            playsInline
                            loop
                            muted
                            autoPlay={true}
                            onError={() => setVideoErrors(prev => ({ ...prev, [post.id]: true }))}
                            onPlay={e => {
                                const playPromise = e.currentTarget.play();
                                if (playPromise !== undefined) {
                                  playPromise.catch(() => { /* Silence */ });
                                }
                            }}
                        />
                     </div>
                </div>
            ) : post.imageUrl && post.imageUrl.trim() !== '' ? (
              <div className="w-full aspect-video bg-neutral-950">
                <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
              </div>
            ) : null}

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-6 border-t border-neutral-800 mt-2 bg-neutral-900/50">
              <button className="flex items-center gap-2 text-neutral-400 hover:text-brand-red transition-colors group">
                <Heart className="w-5 h-5 group-hover:fill-current group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors ml-auto">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trainer Banner (if trainer post) */}
            {post.isTrainer && (
                 <div className="px-4 py-2 bg-gradient-to-r from-red-900/20 to-transparent border-t border-red-900/30 flex items-center gap-2">
                     <BadgeCheck className="w-3 h-3 text-brand-red" />
                     <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider">Official Trainer Post</span>
                 </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};