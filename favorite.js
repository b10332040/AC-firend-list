const BASE_URL = 'https://lighthouse-user-api.herokuapp.com';
const INDEX_URL = BASE_URL + '/api/v1/users';
const USERS_PER_PAGE = 12

const loading = document.querySelector('#js-loading');

const usersSearchResult = document.querySelector('#js-users-search-result')
// const usersChangeCardMode = document.querySelector('#js-users-change-card-mode')
// const usersChangeListMode = document.querySelector('#js-users-change-list-mode')
const usersDataPanel = document.querySelector('#js-users-data-panel')

const modalUserBgi = document.querySelector('#js-modal-user-bgi')
const modalUserFollow = document.querySelector('#js-modal-user-follow')
const modalUserAvatar = document.querySelector('#js-modal-user-avatar')
const modalUserName = document.querySelector('#js-modal-user-name')
const modalUserGender = document.querySelector('#js-modal-user-gender')
const modalUserRegion = document.querySelector('#js-modal-user-region')
const modalUserBirthday = document.querySelector('#js-modal-user-birthday')
const modalUserEmail = document.querySelector('#js-modal-user-email')

let followingUserArray = JSON.parse(localStorage.getItem('followingUsers')) || []

// Function /////////////////////////////////////////////////////////////////

// 顯示/不顯示loading效果
function loadingEffect(action) {
  if (action === 'show') {
    loading.style.display = 'block'
  } else {
    loading.style.display = 'none'
  }
}

// 產生user清單
function renderUserList(data, mode) {
  let rawHTML = ''
  let followHTML = ''

  mode = (typeof mode !== 'undefined') ? mode : 'card'; 
  
  switch (mode) {
    case 'list':
      break

    case 'card':
    default:

      if (data.length === 0) {
        rawHTML += `<p class="mt-5 text-center"><a class="u-text-link" href="index.html" aria-label="前往認識新朋友頁面" title="前往認識新朋友頁面">目前沒有關注的人，趕快認識新朋友吧!</a></p>`
      } else {
        data.forEach((item) => {
          rawHTML += `
            <section class="col-6 col-md-3 col-lg-4 col-xl-2 mb-5">
              <div class="c-user-card is-online" style="background-image: url('${item.avatar}');">
                <div class="c-user-card__body text-center">
                  <div class="c-user-card__follow c-user-follow">
                    <button type="button" class="js-not-follow-user-btn c-user-follow__btn" data-id="${item.id}" title="取消關注" aria-label="取消關注"></button>
                    <i class="bi bi-trash3-fill c-user-follow__icon"></i>
                  </div>
                  <div class="c-user-card__avatar">
                    <div class="ratio ratio-1x1 c-user-card__avatar-ratio">
                      <img src="${item.avatar}" alt="user's avatar" title="user's avatar" aria-label="user's avatar">
                    </div>
                  </div>
                  <div class="c-user-card__main-infos">
                    <h4 class="my-0 c-user-card__name">${item.name} ${item.surname}</h4>
                    <p class="my-0 mt-1 mb-0 c-user-card__region"><small><i class="bi bi-flag-fill"></i> ${item.region}</small></p>
                  </div>
                  <button type="button" class="js-show-user-more col-12 c-user-card__more-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#bs-user-modal" title="More" aria-label="More">More</button>
                </div>
              </div>
            </section>
          `
        })
      }
      
  }
  
  usersDataPanel.innerHTML = rawHTML
}

// 顯示使用者資訊
function showUserModal(id) {
  loadingEffect('show')

  // 清空modal
  modalUserBgi.style.backgroundImage = 'none'
  modalUserAvatar.innerHTML = '<i class="bi bi-person-fill c-user-modal__avatar-icon"></i>'
  modalUserName.innerHTML = ''
  modalUserGender.innerHTML = ''
  modalUserRegion.innerHTML = ''
  modalUserBirthday.innerHTML = ''
  modalUserEmail.innerHTML = ''

  // Call api
  axios
    .get(INDEX_URL + '/' + id)
    .then((response) => {
      if (typeof response.data !== 'undefined') {
        const data = response.data

        modalUserBgi.style.backgroundImage = `url('${data.avatar}')`
        modalUserAvatar.innerHTML = `<img src="${data.avatar}" alt="user's avatar" title="user's avatar" aria-label="user's avatar">`
        modalUserName.innerHTML = `${data.name} ${data.surname}`
        modalUserGender.innerHTML = (data.gender === 'male') ? `<i class="bi bi-gender-male"></i> ${data.age}` : `<i class="bi bi-gender-female"></i> ${data.age}`
        modalUserRegion.innerHTML = `<i class="bi bi-flag-fill"></i> ${data.region}`
        modalUserBirthday.innerHTML = `<i class="bi bi-calendar-event-fill"></i> ${data.birthday}`
        modalUserEmail.innerHTML = `<i class="bi bi-envelope-fill"></i> ${data.email}`
        
        loadingEffect('hide')

      } else {
        console.log('results are not exist.');
        loadingEffect('hide')
      }
      
    })
    .catch((err) => {
      console.log(err);
      loadingEffect('hide')
    });
}

// 取消關注使用者
function notFollowUser(id) {
  id = Number(id)

  const userIndex = followingUserArray.findIndex(followingUser => followingUser.id === id)

  followingUserArray.splice(userIndex, 1)
  localStorage.setItem('followingUsers', JSON.stringify(followingUserArray))
  renderUserList(followingUserArray)
}

// 點擊 users panel
function onUsersPanelClicked(event) {
  if (event.target.matches('.js-show-user-more')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.js-not-follow-user-btn')) {
    notFollowUser(event.target.dataset.id)
  }
}


// Event listener /////////////////////////////////////////////////////
usersDataPanel.addEventListener('click', onUsersPanelClicked)

// /////////////////////////////////////////////////////
renderUserList(followingUserArray)
loadingEffect('hide')

