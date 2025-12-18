// Board JavaScript

console.log('Board.js loaded successfully');

// Supabase client는 auth.js에서 전역으로 초기화됨
// board.js에서는 전역 supabaseClient 변수를 사용

// 전역 supabaseClient에 접근하기 위한 getter
function getSupabaseClient() {
    return window.supabaseClient || null;
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 이메일에서 아이디만 추출
 * @param {string} email - 이메일 주소
 * @returns {string} - '@' 앞부분 아이디
 */
function extractUserId(email) {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
}

/**
 * 날짜 포맷 변환 (YYYY-MM-DD)
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ========================================
// 인증 체크
// ========================================
function checkBoardAuth() {
    const user = localStorage.getItem('user');

    // board.html의 글쓰기 버튼은 항상 표시 (클릭 시 로그인 체크)
    // 버튼 숨김 처리 제거 - UX 개선

    // board-detail.html의 댓글 작성 폼 제어
    const commentLoginRequired = document.getElementById('comment-login-required');
    const commentWriteForm = document.getElementById('comment-write-form');

    if (user) {
        // 로그인 상태 - 댓글 작성 가능
        if (commentLoginRequired) commentLoginRequired.style.display = 'none';
        if (commentWriteForm) commentWriteForm.style.display = 'block';
    } else {
        // 비로그인 상태 - 댓글 작성 불가 (목록은 볼 수 있음)
        if (commentLoginRequired) commentLoginRequired.style.display = 'block';
        if (commentWriteForm) commentWriteForm.style.display = 'none';
    }
}

// 로그인 체크 (글쓰기 등)
function requireLogin() {
    const user = localStorage.getItem('user');
    if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}


// ========================================
// 게시판 목록 (board.html)
// ========================================

// 게시글 목록 로드
async function loadPosts() {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        return;
    }

    try {
        // Supabase에서 게시글 목록과 댓글 수 함께 가져오기 (최신순)
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                comments(id)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading posts:', error);
            return;
        }

        console.log('Posts loaded:', posts);

        // 게시글 목록 렌더링
        renderPosts(posts);

    } catch (error) {
        console.error('loadPosts error:', error);
    }
}

// 게시글 목록 렌더링
function renderPosts(posts) {
    const boardList = document.getElementById('board-list');

    if (!boardList) return;

    // 기존 목록 초기화 (하드코딩된 샘플 데이터 제거)
    boardList.innerHTML = '';

    if (!posts || posts.length === 0) {
        // 게시글이 없을 때
        boardList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    게시글이 없습니다.
                </td>
            </tr>
        `;
        return;
    }

    // 게시글 목록 표시
    posts.forEach((post, index) => {
        const row = document.createElement('tr');
        row.className = 'board-row';

        // 번호 (역순으로 표시)
        const number = posts.length - index;

        // 작성자 이름 (이메일에서 ID 추출)
        const authorName = extractUserId(post.author_email) || post.author_name || '익명';

        // 날짜 포맷
        const formattedDate = formatDate(post.created_at);

        // 댓글 수 계산
        const commentCount = post.comments?.length || 0;

        // 댓글 수 표시 (댓글이 있을 때만)
        const commentBadge = commentCount > 0 ? ` <span class="comment-count">(${commentCount})</span>` : '';

        row.innerHTML = `
            <td class="col-no">${number}</td>
            <td class="col-title">
                <a href="board-detail.html?id=${post.id}">${post.title}${commentBadge}</a>
            </td>
            <td class="col-author">${authorName}</td>
            <td class="col-date">${formattedDate}</td>
            <td class="col-views">${post.views || 0}</td>
        `;

        boardList.appendChild(row);
    });
}


// ========================================
// 글쓰기 (board-write.html)
// ========================================

// 게시글 작성
async function createPost(title, content) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        alert('시스템 오류가 발생했습니다. 다시 시도해주세요.');
        return;
    }

    try {
        // 로컬 스토리지에서 사용자 정보 가져오기
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(userStr);

        // 게시글 데이터 준비
        const postData = {
            title: title.trim(),
            content: content.trim(),
            user_id: user.id,
            author_name: extractUserId(user.email),
            author_email: user.email,
            views: 0
        };

        console.log('게시글 저장 중...', postData);

        // Supabase에 게시글 저장
        const { data, error } = await supabaseClient
            .from('posts')
            .insert([postData])
            .select();

        if (error) {
            console.error('Error creating post:', error);
            alert('게시글 작성에 실패했습니다: ' + error.message);
            return;
        }

        console.log('게시글 작성 성공:', data);
        alert('게시글이 작성되었습니다.');

        // 게시판 목록으로 이동
        window.location.href = 'board.html';

    } catch (error) {
        console.error('createPost error:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
}


// ========================================
// 글 상세보기 (board-detail.html)
// ========================================

// 게시글 상세 로드
async function loadPostDetail(postId) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        return;
    }

    try {
        // Supabase에서 게시글 상세정보 가져오기
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('게시글 로드 오류:', error);
            alert('게시글을 불러올 수 없습니다.');
            return;
        }

        if (!post) {
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = 'board.html';
            return;
        }

        // 조회수 증가
        await supabaseClient
            .from('posts')
            .update({ views: (post.views || 0) + 1 })
            .eq('id', postId);

        // 게시글 내용 표시
        document.querySelector('.post-detail-title').textContent = post.title;
        document.querySelector('.post-author').textContent = `작성자: ${extractUserId(post.author_email)}`;
        document.querySelector('.post-date').textContent = `작성일: ${formatDate(post.created_at)}`;
        document.querySelector('.post-views').textContent = `조회수: ${(post.views || 0) + 1}`;
        document.querySelector('.post-detail-content').innerHTML = `<p>${post.content.replace(/\n/g, '<br>')}</p>`;

        // 작성자 본인이면 수정/삭제 버튼 표시
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id === post.user_id) {
            document.getElementById('author-actions').style.display = 'flex';
        }

        // 댓글 로드
        await loadComments(postId);

    } catch (error) {
        console.error('loadPostDetail error:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게시글 수정
function updatePost(postId, title, content) {
    // TODO: Supabase에서 게시글 수정
    console.log('게시글 수정:', postId, title, content);
}

// 게시글 삭제
async function deletePost(postId) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient || !postId) {
        console.error('Invalid parameters');
        return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        // 댓글 먼저 삭제
        await supabaseClient
            .from('comments')
            .delete()
            .eq('post_id', postId);

        // 게시글 삭제
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('게시글 삭제 오류:', error);
            alert('게시글 삭제에 실패했습니다.');
            return;
        }

        alert('게시글이 삭제되었습니다.');
        window.location.href = 'board.html';

    } catch (error) {
        console.error('deletePost error:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
    }
}

// 댓글 삭제
async function deleteComment(commentId, postId) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient || !commentId) {
        console.error('Invalid parameters');
        return;
    }

    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('댓글 삭제 오류:', error);
            alert('댓글 삭제에 실패했습니다.');
            return;
        }

        alert('댓글이 삭제되었습니다.');
        await loadComments(postId);

    } catch (error) {
        console.error('deleteComment error:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
    }
}

// 댓글 작성
async function createComment(postId, content) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        alert('시스템 오류가 발생했습니다.');
        return;
    }

    try {
        // 로그인 확인
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }

        const user = JSON.parse(userStr);

        // 댓글 데이터 준비
        const commentData = {
            post_id: postId,
            content: content.trim(),
            user_id: user.id,
            author_name: extractUserId(user.email),
            author_email: user.email
        };

        console.log('댓글 저장 중...', commentData);

        // Supabase에 댓글 저장
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([commentData])
            .select();

        if (error) {
            console.error('댓글 저장 오류:', error);
            alert('댓글 작성에 실패했습니다: ' + error.message);
            return;
        }

        console.log('댓글 작성 성공:', data);

        // 댓글 입력창 초기화
        document.getElementById('comment-content').value = '';

        // 댓글 목록 새로고침
        await loadComments(postId);

        alert('댓글이 등록되었습니다.');

    } catch (error) {
        console.error('createComment error:', error);
        alert('댓글 작성 중 오류가 발생했습니다.');
    }
}

// 댓글 목록 로드
async function loadComments(postId) {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        return;
    }

    try {
        // Supabase에서 댓글 목록 가져오기 (최신순)
        const { data: comments, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('댓글 로드 오류:', error);
            return;
        }

        const commentsList = document.getElementById('comments-list');
        const commentCount = document.getElementById('comment-count');

        // 댓글 개수 업데이트
        if (commentCount) {
            commentCount.textContent = comments.length;
        }

        // 댓글 개수 배지 업데이트 (board-detail.html의 스크립트에서 처리)
        const event = new Event('commentsUpdated');
        document.dispatchEvent(event);

        if (!comments || comments.length === 0) {
            // 댓글이 없을 때
            if (commentsList) commentsList.innerHTML = '';
        } else {
            // 댓글이 있을 때

            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const commentsHTML = comments.map(comment => {
                const isAuthor = user.id === comment.user_id;
                const actionsHTML = isAuthor ? `
                    <div class="comment-actions">
                        <button type="button" class="btn-text" onclick="editComment(${comment.id})">수정</button>
                        <button type="button" class="btn-text" onclick="deleteComment(${comment.id}, ${postId})">삭제</button>
                    </div>
                ` : '';

                return `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${extractUserId(comment.author_email)}</span>
                            <span class="comment-date">${formatDate(comment.created_at)}</span>
                        </div>
                        <div class="comment-content">
                            <p>${comment.content.replace(/\n/g, '<br>')}</p>
                        </div>
                        ${actionsHTML}
                    </div>
                `;
            }).join('');

            if (commentsList) commentsList.innerHTML = commentsHTML;
        }

    } catch (error) {
        console.error('loadComments error:', error);
    }
}


// ========================================
// 페이지 초기화
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // Supabase는 auth.js에서 이미 초기화됨

    // 인증 상태 체크
    checkBoardAuth();

    // ===== board.html 이벤트 =====
    // 글쓰기 버튼 - 로그인 체크
    const writeBtnInList = document.getElementById('write-btn');
    if (writeBtnInList) {
        writeBtnInList.addEventListener('click', function() {
            if (requireLogin()) {
                window.location.href = 'board-write.html';
            }
        });

        // 게시글 목록 로드 (board.html에서만)
        loadPosts();
    }


    // ===== board-write.html 이벤트 =====
    const writeForm = document.getElementById('board-write-form');
    if (writeForm) {
        // 페이지 진입 시 로그인 체크
        if (!requireLogin()) {
            return; // 로그인 안 되어있으면 여기서 중단
        }

        writeForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            // 게시글 작성 (async 함수)
            await createPost(title, content);
        });

        // 작성자 표시 (아이디만)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const authorEl = document.getElementById('post-author');
        if (authorEl && user.email) {
            authorEl.textContent = extractUserId(user.email);
        }
    }


    // ===== board-detail.html 이벤트 =====
    const postDetailContainer = document.getElementById('post-detail-container');

    if (postDetailContainer) {
        // URL에서 게시글 ID 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            alert('잘못된 접근입니다.');
            window.location.href = 'board.html';
            return;
        }

        // 게시글 상세 로드
        loadPostDetail(parseInt(postId));

        // 삭제 버튼
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deletePost(parseInt(postId));
            });
        }

        // 댓글 등록 버튼
        const commentSubmitBtn = document.getElementById('comment-submit-btn');
        if (commentSubmitBtn) {
            commentSubmitBtn.addEventListener('click', async function() {
                const commentContent = document.getElementById('comment-content').value;

                if (!commentContent || !commentContent.trim()) {
                    alert('댓글 내용을 입력해주세요.');
                    return;
                }

                await createComment(parseInt(postId), commentContent);
            });
        }
    }

});
