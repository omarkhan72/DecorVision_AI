import analytics from '@react-native-firebase/analytics';

/**
 * Log a screen view to Analytics
 */
export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('Error logging screen view to Analytics:', error);
  }
};

/**
 * Log a button click event to Analytics
 */
export const logButtonClick = async (buttonName: string, screenName?: string, additionalParams?: Record<string, any>) => {
  try {
    await analytics().logEvent('button_click', {
      button_name: buttonName,
      screen_name: screenName || 'unknown',
      ...additionalParams,
    });
  } catch (error) {
    console.error('Error logging button click to Analytics:', error);
  }
};

/**
 * Log a SELECT_CONTENT event (recommended for content selection)
 */
export const logSelectContent = async (contentType: string, itemId: string, itemName: string, additionalParams?: Record<string, any>) => {
  try {
    await analytics().logEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
      item_name: itemName,
      ...additionalParams,
    });
  } catch (error) {
    console.error('Error logging select content to Analytics:', error);
  }
};

/**
 * Log a design generation event
 */
export const logDesignGeneration = async (designType: string, roomType: string, style: string, additionalParams?: Record<string, any>) => {
  try {
    await analytics().logEvent('generate_design', {
      design_type: designType,
      room_type: roomType,
      style: style,
      ...additionalParams,
    });
  } catch (error) {
    console.error('Error logging design generation to Analytics:', error);
  }
};

/**
 * Log an image upload event
 */
export const logImageUpload = async (source: 'camera' | 'gallery', designType?: string) => {
  try {
    await analytics().logEvent('image_upload', {
      source: source,
      design_type: designType || 'unknown',
    });
  } catch (error) {
    console.error('Error logging image upload to Analytics:', error);
  }
};

/**
 * Log a share event
 */
export const logShare = async (contentType: string, itemId?: string) => {
  try {
    await analytics().logEvent('share', {
      content_type: contentType,
      item_id: itemId || 'unknown',
    });
  } catch (error) {
    console.error('Error logging share to Analytics:', error);
  }
};

/**
 * Log a download event
 */
export const logDownload = async (contentType: string, itemId?: string) => {
  try {
    await analytics().logEvent('download', {
      content_type: contentType,
      item_id: itemId || 'unknown',
    });
  } catch (error) {
    console.error('Error logging download to Analytics:', error);
  }
};

/**
 * Set user property
 */
export const setUserProperty = async (name: string, value: string) => {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error('Error setting user property in Analytics:', error);
  }
};

/**
 * Set user ID
 */
export const setUserId = async (userId: string) => {
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.error('Error setting user ID in Analytics:', error);
  }
};

/**
 * Log a custom event
 */
export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    await analytics().logEvent(eventName, params || {});
  } catch (error) {
    console.error('Error logging custom event to Analytics:', error);
  }
};

/**
 * Reset Analytics data (useful for testing)
 */
export const resetAnalyticsData = async () => {
  try {
    await analytics().resetAnalyticsData();
  } catch (error) {
    console.error('Error resetting Analytics data:', error);
  }
};

