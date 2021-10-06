"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  console.debug('getAndShowStoriesOnStart')
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}


/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  if (currentUser) {
    const favoritesArray = currentUser.favorites

    for (let i = 0; i < favoritesArray.length; i++) {
      if (favoritesArray[i].storyId == story.storyId) {
        return $(`
        <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" /><i class="fa fa-heart heart-filled" aria-hidden="true">
        </li>
      `);
      }
    }
  }
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" /><i class="fa fa-heart-o heart-outline" aria-hidden="true">
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/** Gets list of favorite stories from server, generates their HTML, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of favorite stories and generate HTML for them
  if (currentUser) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }

    $favoriteStoriesList.show();
  } else {
    $favoriteStoriesTitle.text('Please login or create an account to add stories to your favorites.')
  }

}


/** Handle story form submission. Setup story instance, add story to page */

async function submitStory(evt) {
  console.debug("submit story", evt);
  evt.preventDefault();

  if (currentUser) {
    // grab the title, author, and url
    const title = $("#story-title").val();
    const author = $("#story-author").val();
    const url = $("#story-url").val();

    // ** Adds story data to API, makes a Story instance, adds it to story list.
    // - user - the current instance of User who will post the story
    // - obj of {title, author, url}
    // Returns the new Story instance
    const newStory = await storyList.addStory(currentUser, { title, author, url });

    $storyForm.trigger("reset");
  } else {
    $storyForm.append('<p class="red">You must login or create an account in order to submit a story.</p>')

  }
}

$storyForm.on("submit", submitStory);

$body.on("click", "i", async function (evt) {
  const targetId = $(evt.target).parent().attr("id"); //id of story we want to favorite or unfavorite
  const targetStory = (await axios.get(`${BASE_URL}/stories/${targetId}`)).data.story //story with that id
  if (currentUser) {
    $(evt.target).toggleClass("fa-heart-o heart-outline fa-heart heart-filled"); //change the heart icon

    for (let i = 0; i < currentUser.favorites.length; i++) { //loop through favorites list
      if (currentUser.favorites[i].storyId == targetId) { //if we find one that matches the target id
        currentUser.removeFromFavorites(currentUser.favorites[i]); // then remove that story from favorites
        return; //and exit function
      }
    }
    currentUser.addToFavorites(targetStory); // if story is not in favorites list, then add to favorites
  }
})
