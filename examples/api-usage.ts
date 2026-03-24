/**
 * Direct API Usage Example
 *
 * This example shows how to use platform services directly.
 */

import { TwitterApiService } from "@umituz/web-social-account/twitter";
import { InstagramApiService } from "@umituz/web-social-account/instagram";
import { YouTubeApiService } from "@umituz/web-social-account/youtube";

// Twitter
async function postTweet(accessToken: string) {
  const twitterService = new TwitterApiService();

  const result = await twitterService.createTweet(accessToken, {
    text: "Hello from @umituz/web-social-account!",
    hashtags: ["#typescript", "#socialmedia"],
  });

  if (result.success) {
    console.log("Tweet posted:", result.data.id);
  } else {
    console.error("Failed to post tweet:", result.error);
  }
}

// Instagram
async function postInstagramPhoto(accessToken: string, userId: string) {
  const instagramService = new InstagramApiService();

  // Create container
  const container = await instagramService.createContainer(accessToken, userId, {
    text: "Beautiful sunset! 🌅 #photography",
    media: [{
      type: "image",
      url: "https://example.com/sunset.jpg",
      altText: "Sunset over the ocean",
    }],
  });

  if (container.success) {
    // Publish container
    const published = await instagramService.publishContainer(
      accessToken,
      userId,
      container.data.id
    );

    if (published.success) {
      console.log("Instagram post published:", published.data.id);
    }
  }
}

// YouTube
async function uploadYouTubeVideo(accessToken: string, videoFile: File) {
  const youtubeService = new YouTubeApiService();

  const result = await youtubeService.uploadVideo(accessToken, videoFile, {
    title: "My Awesome Video",
    description: "This is a test video upload",
    tags: ["typescript", "tutorial"],
    privacy: "public",
  });

  if (result.success) {
    console.log("Video uploaded:", result.data.id);
  }
}
