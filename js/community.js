// Community Page Logic

// Check if user is authenticated
function checkCommunityAuth() {
    const user = localStorage.getItem('user');

    const loginRequired = document.getElementById('login-required');
    const communityContent = document.getElementById('community-content');

    if (user) {
        // User is logged in - show community content
        if (loginRequired) loginRequired.style.display = 'none';
        if (communityContent) communityContent.style.display = 'block';
        loadPosts();
    } else {
        // User is not logged in - show login required message
        if (loginRequired) loginRequired.style.display = 'block';
        if (communityContent) communityContent.style.display = 'none';
    }
}

// Load posts from Supabase
async function loadPosts() {
    try {
        // TODO: Replace with actual Supabase query
        // const { data, error } = await supabase
        //     .from('posts')
        //     .select('*')
        //     .order('created_at', { ascending: false });

        // Mock data for wireframe
        const mockPosts = [
            {
                id: 1,
                title: '바이브코딩 시작하기',
                content: '바이브코딩을 시작하려면 어떻게 해야 하나요?',
                author: 'user1@example.com',
                created_at: '2024-12-09'
            },
            {
                id: 2,
                title: 'HTML5 학습 팁',
                content: 'HTML5를 효과적으로 학습하는 방법을 공유합니다.',
                author: 'user2@example.com',
                created_at: '2024-12-08'
            },
            {
                id: 3,
                title: 'JavaScript 질문',
                content: 'async/await에 대해 질문이 있습니다.',
                author: 'user3@example.com',
                created_at: '2024-12-07'
            }
        ];

        displayPosts(mockPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Display posts
function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    postsList.innerHTML = '';

    if (posts.length === 0) {
        postsList.innerHTML = '<p>아직 게시글이 없습니다.</p>';
        return;
    }

    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
            <h4 class="post-title">${escapeHtml(post.title)}</h4>
            <p class="post-content">${escapeHtml(post.content)}</p>
            <div class="post-meta">
                <span class="post-author">${escapeHtml(post.author)}</span>
                <span class="post-date">${post.created_at}</span>
            </div>
        `;
        postsList.appendChild(postItem);
    });
}

// Create new post
async function createPost(title, content) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        // TODO: Replace with actual Supabase insert
        // const { data, error } = await supabase
        //     .from('posts')
        //     .insert([
        //         {
        //             title: title,
        //             content: content,
        //             author: user.email,
        //             user_id: user.id
        //         }
        //     ]);

        // Mock post creation for wireframe
        console.log('Creating post:', { title, content, author: user.email });

        alert('게시글이 작성되었습니다!');

        // Reload posts
        loadPosts();

        // Reset form
        document.getElementById('post-form').reset();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('게시글 작성에 실패했습니다.');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize community page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkCommunityAuth();

    // Post form handler
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            await createPost(title, content);
        });
    }
});
