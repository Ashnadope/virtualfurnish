import { createClient } from '@/lib/supabase/client';

export const roomDesignService = {
  /**
   * Create a new room design
   * @param {Object} designData - {user_id, name, room_image_url, design_data, is_public}
   */
  async createDesign(designData) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .insert([designData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating design:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update an existing room design
   * @param {string} designId - Design ID
   * @param {Object} updates - Fields to update
   */
  async updateDesign(designId, updates) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', designId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating design:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get all designs for a user
   * @param {string} userId - User ID
   */
  async getUserDesigns(userId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user designs:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Get a specific design by ID
   * @param {string} designId - Design ID
   */
  async getDesignById(designId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .select('*')
        .eq('id', designId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching design:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get a design by share token (for public sharing)
   * @param {string} shareToken - Share token
   */
  async getDesignByShareToken(shareToken) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      // Increment view count
      if (data) {
        await supabase
          .from('room_designs')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching shared design:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete a design
   * @param {string} designId - Design ID
   */
  async deleteDesign(designId) {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('room_designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting design:', error);
      return { error: error.message };
    }
  },

  /**
   * Toggle design public/private status
   * @param {string} designId - Design ID
   * @param {boolean} isPublic - Public status
   */
  async togglePublicStatus(designId, isPublic) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('room_designs')
        .update({ is_public: isPublic })
        .eq('id', designId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error toggling public status:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get signed URL for room image
   * @param {string} imagePath - Path to image in storage
   * @param {number} expiresIn - Expiration time in seconds (default 3600)
   */
  async getSignedUrl(imagePath, expiresIn = 3600) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.storage
        .from('room-uploads')
        .createSignedUrl(imagePath, expiresIn);

      if (error) throw error;
      return { signedUrl: data.signedUrl, error: null };
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return { signedUrl: null, error: error.message };
    }
  }
};
