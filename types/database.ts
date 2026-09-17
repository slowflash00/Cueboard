export type MediaType = 'image' | 'video_link' | 'none';

export type GroupColor =
  | '--group-blue'
  | '--group-green'
  | '--group-yellow'
  | '--group-purple'
  | '--group-peach'
  | '--group-teal';

export interface Board {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BoardWithDetails extends Board {
  posts_count?: number;
  projects_count?: number;
  cover_image_url?: string | null;
}

export interface Project {
  id: string;
  board_id: string;
  user_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  posts_count?: number;
  cover_image_url?: string | null;
}

export interface Post {
  id: string;
  board_id: string;
  user_id: string;
  media_type: MediaType;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  group_key: string | null;
  group_color: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectPost {
  id: string;
  project_id: string;
  post_id: string;
  user_id: string;
  position: number;
  created_at: string;
}

export interface Prompt {
  id: string;
  post_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptPart {
  id: string;
  prompt_id: string;
  user_id: string;
  subheading: string | null;
  body_text: string;
  position: number;
  created_at: string;
}

export interface PostWithDetails extends Post {
  prompt?: Prompt & {
    parts: PromptPart[];
  };
  project_ids?: string[];
  project_posts?: ProjectPost[];
}
