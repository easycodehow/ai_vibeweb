// Board JavaScript
// TODO: Supabase 연동 후 실제 기능 구현 예정

console.log('Board.js loaded successfully');

// ========================================
// 인증 체크
// ========================================
function checkBoardAuth() {
    const user = localStorage.getItem('user');

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
function loadPosts() {
    // TODO: Supabase에서 게시글 목록 가져오기
    console.log('게시글 목록 로드');
}


// ========================================
// 글쓰기 (board-write.html)
// ========================================

// 게시글 작성
function createPost(title, content) {
    // TODO: Supabase에 게시글 저장
    console.log('게시글 작성:', title, content);
}


// ========================================
// 글 상세보기 (board-detail.html)
// ========================================

// 게시글 상세 로드
function loadPostDetail(postId) {
    // TODO: Supabase에서 게시글 상세정보 가져오기
    console.log('게시글 상세 로드:', postId);
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
    console.log('댓글 목록 로드:', postId);
}


// ========================================
// 페이지 초기화
// ========================================

document.addEventListener('DOMContentLoaded', function() {

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
    }


    // ===== board-write.html 이벤트 =====
    const writeForm = document.getElementById('board-write-form');
    if (writeForm) {
        // 페이지 진입 시 로그인 체크
        if (!requireLogin()) {
            return; // 로그인 안 되어있으면 여기서 중단
        }

        writeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            createPost(title, content);
        });

        // 작성자 표시
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const authorEl = document.getElementById('post-author');
        if (authorEl && user.email) {
            authorEl.textContent = user.email;
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
