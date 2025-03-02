export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  taskId: number;
}

export interface CommentInput {
  content: string;
  taskId: number;
}

export interface CommentsRes {
  comments: Comment[];
  total: number;
}
