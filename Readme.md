# NetPulse Engine

NetPulse Engine is a comprehensive backend system integrating functionalities of video streaming platforms and social media, ideal for platforms combining video sharing and micro-blogging.

Key Features
- Video Management: Seamless video streaming, uploading, and management integration akin to YouTube.
- Micro-blogging: Twitter-like capabilities including posting tweets, following users, and engaging with content.
- User Authentication: Secure user authentication and authorization using JWT.
- User Profiles: Profile creation and customization.
- Subscriptions: System for following channels.
- Playlists: Create and manage playlists, add or remove videos.
- Comments and Likes: Engage with videos and posts through comments and likes.
- Robust API: RESTful API endpoints for all core functionalities.

Explore the project's [data models](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj) to delve deeper into its architectural design and schema.

# Installation

1. Clone the repository.
```
git clone https://github.com/git-pixel22/NetPulse-Engine.git
cd NetPulse-Engine
```
2. Install dependencies.
```
npm install
```
3. Configure environment variables. Create a `.env` file in the root directory and add the following:

```
PORT=port-number
MONGODB_URL=<your-mongodb-uri>
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=<your-access-token-expiry>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=<your-refersh-token-expiry>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```
# Running the Application
```
npm run dev
```

Feel free to use this in any of your FrontEnd projects/builds, and to ping me if you find any issues using this. : )
