// Board JavaScript

console.log('Board.js loaded successfully');

// Supabase client는 auth.js에서 전역으로 초기화됨
// board.js에서는 전역 supabase 변수를 사용

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
    if (!supabase) {
        console.error('Supabase not initialized');
        return;
    }

    try {
        // Supabase에서 게시글 목록과 댓글 수 함께 가져오기 (최신순)
        const { data: posts, error } = await supabase
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
    if (!supabase) {
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
        const { data, error } = await supabase
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
function loadPostDetail(postId) {
    // TODO: Supabase에서 게시글 상세정보 가져오기
    // 작성자 이메일을 아이디로 변환: extractUserId(post.author_email)
    console.log('게시글 상세 로드:', postId);

    // 예시:
    // const userId = extractUserId(post.author_email);
    // document.querySelector('.post-author').textContent = `작성자: ${userId}`;
}

// 게시글 수정
function updatePost(postId, title, content) {
    // TODO: Supabase에서 게시글 수정
    console.log('게시글 수정:', postId, title, content);
}

// 게시글 삭제
function deletePost(postId) {
    // TODO: Supabase에서 게시글 삭제
    console.log('게시글 삭제:', postId);
}

// 댓글 작성
function createComment(postId, content) {
    // TODO: Supabase에 댓글 저장
    console.log('댓글 작성:', postId, content);
}

// 댓글 목록 로드
function loadComments(postId) {
    // TODO: Supabase에서 댓글 목록 가져오기
    // 댓글 작성자 이메일을 아이디로 변환: extractUserId(comment.author_email)
    console.log('댓글 목록 로드:', postId);

    // 예시:
    // comments.forEach(comment => {
    //     const userId = extractUserId(comment.author_email);
    //     // userId를 화면에 표시
    // });
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
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');

    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // TODO: 수정 페이지로 이동 또는 인라인 수정
            console.log('수정 버튼 클릭');
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('정말 삭제하시겠습니까?')) {
                // TODO: 게시글 삭제
                console.log('삭제 버튼 클릭');
            }
        });
    }

    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', function() {
            const commentContent = document.getElementById('comment-content').value;

            if (!commentContent) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            // TODO: 댓글 작성
            createComment(1, commentContent);
        });
    }

});
