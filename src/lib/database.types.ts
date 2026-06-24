export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          batch_id: string | null
          body: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          batch_id?: string | null
          body: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          batch_id?: string | null
          body?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          date: string
          id: string
          marked_at: string | null
          marked_by: string | null
          routine_id: string
          status: string
          student_id: string
        }
        Insert: {
          date: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          routine_id: string
          status: string
          student_id: string
        }
        Update: {
          date?: string
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          routine_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          capacity: number
          course_id: string | null
          created_at: string | null
          end_date: string | null
          fee: number
          id: string
          is_active: boolean
          name: string
          start_date: string | null
        }
        Insert: {
          capacity?: number
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          name: string
          start_date?: string | null
        }
        Update: {
          capacity?: number
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          batch_id: string
          enrolled_at: string | null
          id: string
          status: string
          student_id: string
        }
        Insert: {
          batch_id: string
          enrolled_at?: string | null
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          batch_id?: string
          enrolled_at?: string | null
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          batch_id: string
          created_at: string | null
          exam_date: string
          id: string
          title: string
          topic_id: string | null
          total_marks: number
          type: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          exam_date: string
          id?: string
          title: string
          topic_id?: string | null
          total_marks?: number
          type: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          exam_date?: string
          id?: string
          title?: string
          topic_id?: string | null
          total_marks?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      mcqs: {
        Row: {
          chapter: string | null
          correct_option: string
          created_at: string | null
          explanation: string | null
          id: string
          level: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string | null
        }
        Insert: {
          chapter?: string | null
          correct_option: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          level?: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id?: string | null
        }
        Update: {
          chapter?: string | null
          correct_option?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          level?: string | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcqs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level: string | null
          public_url: string | null
          storage_path: string
          title: string
          topic_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string | null
          public_url?: string | null
          storage_path: string
          title: string
          topic_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string | null
          public_url?: string | null
          storage_path?: string
          title?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          batch_id: string
          created_at: string | null
          id: string
          installment_number: number | null
          is_installment: boolean
          method: string
          month: string
          note: string | null
          paid_on: string
          receipt_number: string | null
          reconciled: boolean
          reconciled_at: string | null
          reconciled_by: string | null
          recorded_by: string | null
          student_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          batch_id: string
          created_at?: string | null
          id?: string
          installment_number?: number | null
          is_installment?: boolean
          method: string
          month: string
          note?: string | null
          paid_on?: string
          receipt_number?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          recorded_by?: string | null
          student_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string
          created_at?: string | null
          id?: string
          installment_number?: number | null
          is_installment?: boolean
          method?: string
          month?: string
          note?: string | null
          paid_on?: string
          receipt_number?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          recorded_by?: string | null
          student_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payments_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          level: string
          published: boolean | null
          published_at: string | null
          read_time_min: number
          slug: string
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          level: string
          published?: boolean | null
          published_at?: string | null
          read_time_min?: number
          slug: string
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          level?: string
          published?: boolean | null
          published_at?: string | null
          read_time_min?: number
          slug?: string
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_topics"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch_id: string | null
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          created_at: string | null
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number
          remarks: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained: number
          remarks?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          remarks?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          new_role: string
          old_role: string
          target_user: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          new_role: string
          old_role: string
          target_user: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_role?: string
          old_role?: string
          target_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "role_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_log_target_user_fkey"
            columns: ["target_user"]
            isOneToOne: false
            referencedRelation: "payment_due"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "role_audit_log_target_user_fkey"
            columns: ["target_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          batch_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          link: string | null
          platform: string
          start_time: string
          subject: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          link?: string | null
          platform?: string
          start_time: string
          subject: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          link?: string | null
          platform?: string
          start_time?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          description: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      batches_with_counts: {
        Row: {
          capacity: number | null
          created_at: string | null
          end_date: string | null
          enrolled_count: number | null
          fee: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          seats_remaining: number | null
          start_date: string | null
        }
        Relationships: []
      }
      payment_due: {
        Row: {
          batch_id: string | null
          batch_name: string | null
          due_month: string | null
          full_name: string | null
          monthly_fee: number | null
          outstanding: number | null
          paid_this_month: number | null
          phone: string | null
          status: string | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_user_by_admin: { Args: { p_user_id: string }; Returns: undefined }
      get_all_exam_stats_for_student: {
        Args: { p_student_id: string }
        Returns: {
          class_avg: number
          exam_id: string
          student_rank: number
          total_appeared: number
        }[]
      }
      get_batch_leaderboard: {
        Args: { p_batch_id: string }
        Returns: {
          exams_count: number
          full_name: string
          rank: number
          student_id: string
          total_marks: number
        }[]
      }
      get_exam_stats: {
        Args: { p_exam_id: string; p_student_id: string }
        Returns: {
          class_avg: number
          student_rank: number
          total_appeared: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
