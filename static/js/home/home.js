document.addEventListener('DOMContentLoaded', function() {
    // Modal for creating a post
    var postModal = document.getElementById("postModal");
    var postBtn = document.getElementById("myBtn");
    var closeSpan = document.getElementsByClassName("close")[0];
    
    // When the user clicks the button, open the post modal
    postBtn.onclick = function() {
      postModal.style.display = "block";
    };
    
    // When the user clicks on <span> (x), close the post modal
    closeSpan.onclick = function() {
      postModal.style.display = "none";
    };
    
    // AJAX for creating a post
    document.getElementById('postSubmit').addEventListener('click', function() {
      var content = document.getElementById('postContent').value;
      var formData = new FormData();
      formData.append('content', content);
    
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/create_post', true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
          postModal.style.display = "none";
          document.getElementById('postContent').value = '';
        }
      };
      xhr.send(formData);
    });
  
    // Handle clicks outside of modals
    window.addEventListener('click', function(event) {
      if (event.target == postModal) {
        postModal.style.display = "none";
      }
      var commentsModal = document.getElementById('commentsModal');
      if (event.target == commentsModal) {
        commentsModal.style.display = "none";
      }
    });
  });
  
  function openComments(postId) {
    // Logic to load comments and display the modal
    var commentsModal = document.getElementById('commentsModal');
    var commentsContainer = document.getElementById('commentsContainer');
  
    // Clear previous comments
    commentsContainer.innerHTML = '';
  
    // Fetch comments using AJAX
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/get_comments/${postId}`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var comments = JSON.parse(xhr.responseText);
        comments.forEach(function(comment) {
          var commentDiv = document.createElement('div');
          commentDiv.textContent = comment.user + ': ' + comment.content;
          commentsContainer.appendChild(commentDiv);
        });
      }
    };
    xhr.send();
  
    commentsModal.style.display = 'block';
  
  // Set the current post ID as a data attribute on the comment submit button
  var commentButton = document.getElementById('submitCommentButton');
  commentButton.setAttribute('data-post-id', postId);
}
  
  // Function to close the modal
  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'none';
  }

  function submitComment(postId) {
    var postId = document.getElementById('submitCommentButton').getAttribute('data-post-id');
  var content = document.getElementById('newCommentContent').value;
    
    if (content) {
      // Prepare the data
      var formData = new FormData();
      formData.append('content', content);
  
      // AJAX request to send the comment
      var xhr = new XMLHttpRequest();
      xhr.open('POST', `/add_comment/${postId}`, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          // Handle response here. For example, close the modal and clear the input
          document.getElementById('commentsModal').style.display = 'none';
          document.getElementById('newCommentContent').value = '';
        }
      };
      xhr.send(formData);
    }
  }
  