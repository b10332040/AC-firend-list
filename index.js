// localStorage.removeItem('followingUsers')
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com';
const INDEX_URL = BASE_URL + '/api/v1/users';
const USERS_PER_PAGE = 12

const loading = document.querySelector('#js-loading');
const photoTime = document.querySelector('#js-photo-time')
const indexCarousel = document.querySelector('#index-carousel')

const searchForm = document.querySelector('#js-search-form')
const searchInput = document.querySelector('#js-search-input')
const searchResult = document.querySelector('#js-search-result')
const dataPanel = document.querySelector('#js-data-panel')
const pagination = document.querySelector('#js-pagination')
const changeModes = document.querySelector('#js-change-modes')

const modalUserBgi = document.querySelector('#js-modal-user-bgi')
const modalUserFollow = document.querySelector('#js-modal-user-follow')
const modalUserAvatar = document.querySelector('#js-modal-user-avatar')
const modalUserName = document.querySelector('#js-modal-user-name')
const modalUserGender = document.querySelector('#js-modal-user-gender')
const modalUserRegion = document.querySelector('#js-modal-user-region')
const modalUserBirthday = document.querySelector('#js-modal-user-birthday')
const modalUserEmail = document.querySelector('#js-modal-user-email')

const userMap = {}
let userArray = []
let filteredUserArray = []
let filterUserKeysArray = ['name', 'surname', 'email', 'age', 'region', 'birthday']
let followingUserArray = JSON.parse(localStorage.getItem('followingUsers')) || []
let currentPage = 1
let currentMode = 'card'

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
function renderUsersDataPanel(data, mode) {
  let rawHTML = ''
  let followHTML = ''

  mode = (typeof mode !== 'undefined') ? mode : 'card'
  dataPanel.innerHTML = ''

  if (mode === 'card') {
    data.forEach((item) => {
      if (followingUserArray.some(followingUser => followingUser.id === item.id)) {
        followHTML = `
          <div class="c-user-card__follow c-user-follow">
            <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${item.id}" title="取消關注" aria-label="取消關注"></button>
            <i class="bi bi-heart-fill c-user-follow__icon"></i>
          </div>
        `
      } else {
        followHTML = `
          <div class="c-user-card__follow c-user-follow">
            <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${item.id}" title="關注" aria-label="關注"></button>
            <i class="bi bi-heart c-user-follow__icon"></i>
          </div>
        `
      }

      rawHTML += `
        <section class="col-6 col-md-3 col-lg-4 col-xl-2 mb-5">
          <div class="c-user-card is-online" style="background-image: url('${item.avatar}');">
            <div class="c-user-card__body text-center">
              ${followHTML}
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

  } else {
    data.forEach((item) => {
      if (followingUserArray.some(followingUser => followingUser.id === item.id)) {
        followHTML = `
          <div class="c-user-list__follow c-user-follow">
            <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${item.id}" title="取消關注" aria-label="取消關注"></button>
            <i class="bi bi-heart-fill c-user-follow__icon"></i>
          </div>
        `
      } else {
        followHTML = `
          <div class="c-user-list__follow c-user-follow">
            <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${item.id}" title="關注" aria-label="關注"></button>
            <i class="bi bi-heart c-user-follow__icon"></i>
          </div>
        `
      }

      rawHTML += `
        <section class="col-12 col-lg-6 mb-3">
          <div class="c-user-list is-online" style="background-image: url('${item.avatar}');">
            <div class="c-user-list__body">
              ${followHTML}
              <div class="c-user-list__avatar">
                <div class="ratio ratio-1x1 c-user-list__avatar-ratio">
                  <img src="${item.avatar}" alt="user's avatar" title="user's avatar" aria-label="user's avatar">
                </div>
              </div>
              <div class="c-user-list__main-infos">
                <h4 class="my-0 c-user-list__name">${item.name} ${item.surname}</h4>
                <p class="my-0 mt-1 mb-0 c-user-list__region"><small><i class="bi bi-flag-fill"></i> ${item.region}</small></p>
                <button type="button" class="js-show-user-more col-12 c-user-list__more-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#bs-user-modal" title="More" aria-label="More">More</button>
              </div>
            </div>
          </div>
        </section>
      `
    })
  }
  
  dataPanel.innerHTML = rawHTML
}

// 產生user頁碼
function renderUsersPagination(amount) {
  const totalPage = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  if (totalPage !== 1) {
    for (let page = 1; page <= totalPage; page++) {
      let pageActiveClassName = ''
      if (page === 1) {
        pageActiveClassName = 'is-active'
      }

      rawHTML += `
        <li class="page-item c-pagination__item">
          <a href="#article-user-list" class="js-pagination-link c-pagination__link ${pageActiveClassName}" data-page="${page}" title="page ${page}" aria-label="page ${page}">${page}</a>
        </li>
      `
    }
  }
  
  pagination.innerHTML = rawHTML
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

// 從頁碼取得User列表
function getUsersByPage(page) {
  // page 1 -> users 0 - 11
  // page 2 -> users 12 - 23
  // ...
  const data = filteredUserArray.length ? filteredUserArray : userArray
  const startIndex = (Number(page) - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  return data.slice(startIndex, endIndex)
}

// 當input沒有值時顯示所有user
function showAllUserWhenInputIsEmpty(event) {
  const originalKeyword = event.target.value.trim()
  const inputKeywords = (originalKeyword === '') ? '' : originalKeyword.toLowerCase().split(' ')

  if (inputKeywords.length === 0) {
    // 沒有輸入關鍵字，清空[過濾user列表]，避免render user list 會印出 [過濾user列表]的資料
    filteredUserArray = []
    searchInput.value = ''

    currentPage = 1

    renderUsersPagination(userArray.length)
    renderUsersDataPanel(getUsersByPage(currentPage), currentMode)
    updateUsersSearchResultByPage(currentPage)
  }
}

// 更新搜尋結果
function updateUsersSearchResultByPage(page) {
  const data = filteredUserArray.length ? filteredUserArray : userArray
  const searchTotal = data.length
  const searchStart = ((Number(page) - 1) * USERS_PER_PAGE) + 1
  const searchEnd = (searchTotal < (searchStart + USERS_PER_PAGE - 1)) ? searchTotal : searchStart + USERS_PER_PAGE - 1
  let searchResultHTML = ''

  if (data.length === 1) {
    searchResultHTML = `共 <b>${data.length}</b> 筆`
  } else if (data.length > 0){
    searchResultHTML = `目前第 <b>${searchStart}</b> 筆 - 第<b>${searchEnd}</b>筆，共 <b>${data.length}</b> 筆`
  }

  searchResult.innerHTML = searchResultHTML
}

// 關注使用者
function followUser(followBtn) {
  const targetFollowBtn = followBtn.parentElement
  let followHTML = ''

  id = Number(followBtn.dataset.id)
  targetFollowBtn.innerHTML = ''

  if (followingUserArray.some(followingUser => followingUser.id === id)) {
    // 已關注->取消關注
    const userIndex = followingUserArray.findIndex(followingUser => followingUser.id === id)
    followingUserArray.splice(userIndex, 1)
    
    // 呈現關注UI
    followHTML = `
      <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${id}" title="關注" aria-label="關注"></button>
      <i class="bi bi-heart c-user-follow__icon"></i>
    `

  } else {
    // 尚未關注->關注
    followingUserArray.push(userMap[id])
    
    // 呈現取消關注UI
    followHTML = `
      <button type="button" class="js-follow-user-btn c-user-follow__btn" data-id="${id}" title="取消關注" aria-label="取消關注"></button>
      <i class="bi bi-heart-fill c-user-follow__icon"></i>
    `
  }
  localStorage.setItem('followingUsers', JSON.stringify(followingUserArray))
  targetFollowBtn.innerHTML = followHTML
}

// 點擊 users panel
function onUsersPanelClicked(event) {
  if (event.target.matches('.js-show-user-more')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.js-follow-user-btn')) {
    followUser(event.target)
  }
}

// 點擊頁碼
function onUsersPaginationClicked(event) {
  if (event.target.matches('.js-pagination-link') && !event.target.classList.contains('is-active')) {
    const clickedPage = event.target
    const prevClickedPage = document.querySelector('.js-pagination-link.is-active')

    currentPage = clickedPage.dataset.page

    prevClickedPage.classList.remove('is-active')
    clickedPage.classList.add('is-active')
    renderUsersDataPanel(getUsersByPage(currentPage), currentMode)
    updateUsersSearchResultByPage(currentPage)
  }
}

// 點擊顯示模式
function onChangeModesClicked(event) {
  if (event.target.matches('.js-change-mode') && !event.target.classList.contains('is-active')) {
    const clickedMode = event.target
    const prevClickedMode = document.querySelector('.js-change-mode.is-active')

    currentMode = clickedMode.dataset.mode

    prevClickedMode.classList.remove('is-active')
    clickedMode.classList.add('is-active')
    renderUsersDataPanel(getUsersByPage(currentPage), currentMode)
  }
}

// 搜尋表單提交
function onUsersSearchFormSubmitted(event) {
  event.preventDefault()
  const originalKeyword = searchInput.value.trim()
  const inputKeywords = (originalKeyword === '') ? '' : originalKeyword.toLowerCase().split(' ')

  if (inputKeywords.length === 0) {
    // 沒有輸入關鍵字，直接抓全部的usr
    filteredUserArray = []
    for (const user of userArray) {
      filteredUserArray.push(user)
    }
    searchInput.value = ''

  } else {
    filteredUserArray = userArray.filter((user) => {
      let meetKeywords = true
      let combineFilterUserValue = ''

      for (const filterUserKey of filterUserKeysArray) {
        if (typeof user[filterUserKey] !== 'undefined') {
          combineFilterUserValue += user[filterUserKey].toString().toLowerCase()
        }
      }

      for (const inputKeyword of inputKeywords) {
        if ((inputKeyword === 'male' || inputKeyword === 'female') && typeof user['gender'] !== 'undefined') {
          // 因為female 包含 male單字，故額外處理
          if (user['gender'].toLowerCase() !== inputKeyword) {
            meetKeywords = false
          }
          
        } else if (!(combineFilterUserValue.includes(inputKeyword))) {
          // 避免 age number型別無法使用toLowerCase()
          meetKeywords = false
        }
      }
      
      return meetKeywords
    })

    // 找不到資料
    if (filteredUserArray.length === 0) {
      searchResult.innerHTML = `共<b>0</b>筆資料`
      dataPanel.innerHTML = `<p class="text-center mt-5"> 搜尋不到有 <b>${originalKeyword}</b> 關鍵字的人。 </p>`
      pagination.innerHTML = ''
      return
    }
  }

  currentPage = 1

  renderUsersPagination(filteredUserArray.length)
  renderUsersDataPanel(getUsersByPage(currentPage), currentMode)
  updateUsersSearchResultByPage(currentPage)
}


// Event listener /////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function(){
  new bootstrap.Carousel(indexCarousel)
})

dataPanel.addEventListener('click', onUsersPanelClicked)
pagination.addEventListener('click', onUsersPaginationClicked)
changeModes.addEventListener('click', onChangeModesClicked)
searchForm.addEventListener('submit', onUsersSearchFormSubmitted)
searchInput.addEventListener('input', showAllUserWhenInputIsEmpty)

// Call API /////////////////////////////////////////////////////
axios
  .get(INDEX_URL)
  .then((response) => {
    if (typeof response.data.results !== 'undefined') {
      userArray = response.data.results

      // 將userArray轉成物件格式資料，以方便做追蹤功能
      userArray.forEach((user) => {
        userMap[user.id] = user
      })

      renderUsersPagination(userArray.length)
      renderUsersDataPanel(getUsersByPage(currentPage), currentMode)
      updateUsersSearchResultByPage(currentPage)
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


