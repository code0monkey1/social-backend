# About This Project

This project is a showcase of how to create a comprehensive backend system with integrated social media components. Built utilizing Test-Driven Development (TDD) and employing the best industry practices, this project showcases a robust and high-quality backend system.

The overarching aim is to aid in the development of robust and user-friendly applications. The project puts into practice several real-world features that you typically find across numerous web applications. This includes handling user authentication, managing user-followers relationships, providing personalized recommendations, interacting with posts through comments, likes, and more.

The backend system operates on expressive and RESTful routes, making it easy for the front-end to interact with the data. This project reflects best practices in software development to ensure the code's reliability, maintainability, and scalability. This includes strictly adhering to the Test-Driven Development (TDD) methodology.

By adhering to best practices and utilizing TDD, we ensure that our code is of high quality, is well tested, robust, and serves its purpose well. The TDD approach guarantees that all the features we develop are necessary and functional eliminating any redundant code and making our project more maintainable and scalable.

By exploring through this project, you'll gain insights into how to structure your endpoints, manage data flow, handle authentication and errors, and carry out efficient practices such as pagination. Also, it's an ideal platform to understand how to implement social media components into applications - an increasingly crucial feature in modern web development.

Feel free to dive deeper into the project, explore the codebase and the related documentation. It will provide you with an in-depth understanding of how to develop a complete, practical, and robust backend system that adheres to best practices and employs TDD comprehensively. This project is an embodiment of high-quality software development where best practices meet functionality to create a truly robust and efficient backend system.

## Auth Routes

1. **/auth/login**: Used to log in a user using their credentials.
2. **/auth/register**: Used to register a new user to the system.
3. **/auth/logout**: Used to log out a user from the system.
4. **/auth/refresh**: Used to refresh the user's authentication token.

## User Routes

1. **/users**: Fetches a list of all users.
2. **/users/:userId**: Fetches the details of a specific user.
3. **/users/:userId/avatar**: Fetches the avatar of a specific user.
4. **/users/:userId/follow**: Follow a specific user.
5. **/users/:userId/unfollow**: Unfollow a specific user.
6. **/users/:userId/recommendations**: Fetches the recommendations for a specific user.

## Post Routes

1. **/posts**: Fetches a list of all posts.
2. **/posts/:postId**: Fetches the details of a specific post.
3. **/posts/:postId/photo**: Fetches the photo of a specific post.
4. **/posts/:postId/comment**: Comment on a specific post.
5. **/posts/:postId/uncomment**: Delete a comment on a specific post.
6. **/posts/:postId/like**: Like a specific post.
7. **/posts/:postId/unlike**: Unlike a specific post.
8. **/posts/by/user/:userId**: Fetch all the posts by a specific user.
9. **/posts/feed/user/:userId**: Get the feed for a specific user.

## Self Routes

1. **/self**: Fetches information about the logged-in user.

---

## CI Pipeline:

Ci/Cd pipeline added using github actions
