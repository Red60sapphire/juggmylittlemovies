
const STORAGE_KEYS = { users:'jmlm_users', session:'jmlm_session', settings:'jmlm_settings', history:'jmlm_history', watchlist:'jmlm_watchlist', continueWatching:'jmlm_continue' };
const PLACEHOLDER_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231B2136" width="300" height="450"/%3E%3Ctext fill="%23555E77" font-family="Inter,sans-serif" font-size="14" x="150" y="225" text-anchor="middle" dominant-baseline="central"%3ENo Poster%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_BACKDROP = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"%3E%3Crect fill="%23111520" width="1280" height="720"/%3E%3Ctext fill="%23555E77" font-family="Inter,sans-serif" font-size="18" x="640" y="360" text-anchor="middle" dominant-baseline="central"%3ENo Backdrop%3C/text%3E%3C/svg%3E';
const MOCK_MOVIES = [
  { id:1,title:'Inception',overview:'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',poster_path:null,backdrop_path:null,vote_average:8.4,release_date:'2010-07-16',genre_ids:[28,878] },
  { id:2,title:'The Dark Knight',overview:'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.',poster_path:null,backdrop_path:null,vote_average:8.5,release_date:'2008-07-18',genre_ids:[28,80,18] },
  { id:3,title:'Interstellar',overview:'When Earth becomes uninhabitable, a team of explorers travels through a wormhole in search of a new home.',poster_path:null,backdrop_path:null,vote_average:8.7,release_date:'2014-11-07',genre_ids:[12,878,18] },
  { id:4,title:'The Matrix',overview:'A computer programmer discovers that reality is a simulation created by machines.',poster_path:null,backdrop_path:null,vote_average:8.2,release_date:'1999-03-31',genre_ids:[28,878] },
  { id:5,title:'Parasite',overview:'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',poster_path:null,backdrop_path:null,vote_average:8.5,release_date:'2019-05-30',genre_ids:[35,18,53] },
  { id:6,title:'Spirited Away',overview:'During her family move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by spirits.',poster_path:null,backdrop_path:null,vote_average:8.6,release_date:'2001-07-20',genre_ids:[16,14,12] },
  { id:7,title:'Pulp Fiction',overview:'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',poster_path:null,backdrop_path:null,vote_average:8.5,release_date:'1994-10-14',genre_ids:[53,80] },
  { id:8,title:'The Shawshank Redemption',overview:'A banker is sentenced to life in Shawshank State Penitentiary for the murder of his wife.',poster_path:null,backdrop_path:null,vote_average:8.7,release_date:'1994-09-23',genre_ids:[18,80] },
  { id:9,title:'Dune',overview:'A noble family becomes embroiled in a war for control over the galaxy most valuable resource.',poster_path:null,backdrop_path:null,vote_average:8.0,release_date:'2021-09-15',genre_ids:[878,12] },
  { id:10,title:'Everything Everywhere All at Once',overview:'A middle-aged Chinese immigrant discovers she can connect with parallel universe versions of herself.',poster_path:null,backdrop_path:null,vote_average:7.9,release_date:'2022-03-25',genre_ids:[28,12,878] },
  { id:11,title:'Blade Runner 2049',overview:'A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.',poster_path:null,backdrop_path:null,vote_average:7.7,release_date:'2017-10-04',genre_ids:[878,53,18] },
  { id:12,title:'The Grand Budapest Hotel',overview:'A writer encounters the owner of an aging high-class hotel, who tells of his early years as a lobby boy.',poster_path:null,backdrop_path:null,vote_average:8.1,release_date:'2014-02-06',genre_ids:[35,18] },
  { id:13,title:'Mad Max: Fury Road',overview:'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland.',poster_path:null,backdrop_path:null,vote_average:8.1,release_date:'2015-05-13',genre_ids:[28,12,878] },
  { id:14,title:'Your Name',overview:'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',poster_path:null,backdrop_path:null,vote_average:8.5,release_date:'2016-08-26',genre_ids:[16,10749,18] },
  { id:15,title:'The Batman',overview:'When a sadistic serial killer begins murdering key political figures in Gotham, Batman must uncover the corruption.',poster_path:null,backdrop_path:null,vote_average:7.8,release_date:'2022-03-04',genre_ids:[28,80,18] },
  { id:16,title:'Oppenheimer',overview:'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',poster_path:null,backdrop_path:null,vote_average:8.2,release_date:'2023-07-21',genre_ids:[18,36,53] },
  { id:17,title:'The Social Network',overview:'As Harvard student Mark Zuckerberg creates the social networking site that would become Facebook.',poster_path:null,backdrop_path:null,vote_average:7.4,release_date:'2010-10-01',genre_ids:[18,36] },
  { id:18,title:'Gladiator',overview:'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.',poster_path:null,backdrop_path:null,vote_average:8.2,release_date:'2000-05-01',genre_ids:[28,18,36] },
  { id:19,title:'LOTR: Fellowship',overview:'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the One Ring.',poster_path:null,backdrop_path:null,vote_average:8.4,release_date:'2001-12-19',genre_ids:[12,14,28] },
  { id:20,title:'Coco',overview:'A young musician enters the Land of the Dead to find his great-great-grandfather.',poster_path:null,backdrop_path:null,vote_average:8.2,release_date:'2017-10-27',genre_ids:[16,35,14] }
];
const MOCK_TV = [
  { id:101,title:'Stranger Things',name:'Stranger Things',overview:'When a young boy disappears, a small town uncovers a mystery involving secret experiments.',poster_path:null,backdrop_path:null,vote_average:8.6,first_air_date:'2016-07-15',genre_ids:[18,878,9648] },
  { id:102,title:'Game of Thrones',name:'Game of Thrones',overview:'Nine noble families fight for control over the lands of Westeros.',poster_path:null,backdrop_path:null,vote_average:8.4,first_air_date:'2011-04-17',genre_ids:[18,10759,10765] },
  { id:103,title:'Breaking Bad',name:'Breaking Bad',overview:'A high school chemistry teacher diagnosed with terminal lung cancer turns to manufacturing methamphetamine.',poster_path:null,backdrop_path:null,vote_average:8.9,first_air_date:'2008-01-20',genre_ids:[18,53,80] },
  { id:104,title:'The Crown',name:'The Crown',overview:'Follows the political rivalries and romance of Queen Elizabeth II reign.',poster_path:null,backdrop_path:null,vote_average:8.1,first_air_date:'2016-11-04',genre_ids:[18,36] },
  { id:105,title:'Arcane',name:'Arcane',overview:'Set in the utopian Piltover and the oppressed underground of Zaun, two sisters fight on rival sides.',poster_path:null,backdrop_path:null,vote_average:8.7,first_air_date:'2021-11-06',genre_ids:[16,10759,18] }
];
const GENRE_NAMES = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};
const MOVIE_PICKER_ITEMS = [
  {id:1,title:'Inception',year:'2010',poster:null},{id:2,title:'The Dark Knight',year:'2008',poster:null},
  {id:3,title:'Interstellar',year:'2014',poster:null},{id:5,title:'Parasite',year:'2019',poster:null},
  {id:9,title:'Dune',year:'2021',poster:null},{id:4,title:'The Matrix',year:'1999',poster:null},
  {id:13,title:'Mad Max: Fury Road',year:'2015',poster:null},{id:7,title:'Pulp Fiction',year:'1994',poster:null},
  {id:15,title:'The Batman',year:'2022',poster:null},{id:16,title:'Oppenheimer',year:'2023',poster:null}
];
function $(id){return document.getElementById(id)}
function qs(s){return document.querySelector(s)}
function qsa(s){return document.querySelectorAll(s)}
function esc(s){if(typeof s!=='string')return s;return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function djb2(str){let hash=5381;for(let i=0;i<str.length;i++)hash=((hash<<5)+hash)+str.charCodeAt(i);return hash>>>0}
function lsGet(k,def){try{var d=localStorage.getItem(k);return d?JSON.parse(d):def}catch(e){return def}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function lsRemove(k){try{localStorage.removeItem(k)}catch(e){}}
function getImageUrl(path,size){if(path)return 'https://image.tmdb.org/t/p/'+(size||'w342')+path;return PLACEHOLDER_POSTER}
function getBackdropUrl(path){if(path)return 'https://image.tmdb.org/t/p/original'+path;return PLACEHOLDER_BACKDROP}
function formatRating(v){return(v/2).toFixed(1)}
function formatTime(s){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h>0?h+'h '+m+'m':m+'m'}var sidebarCollapsed=false;
function toggleSidebar(){sidebarCollapsed=!sidebarCollapsed;$('sidebar').classList.toggle('collapsed',sidebarCollapsed)}
function toggleMobileSidebar(){$('sidebar').classList.toggle('mobile-open')}
function getUsers(){return lsGet(STORAGE_KEYS.users,[])}
function saveUsers(u){lsSet(STORAGE_KEYS.users,u)}
function getSession(){return lsGet(STORAGE_KEYS.session,null)}
function saveSession(s){lsSet(STORAGE_KEYS.session,s)}
function isLoggedIn(){return!!getSession()}
function getCurrentUser(){var s=getSession();if(!s)return null;var users=getUsers();return users.find(function(u){return u.username===s.username})||null}
function hashPassword(pw){return djb2(pw).toString(36)}
function register(username,password){
  var users=getUsers();
  if(users.find(function(u){return u.username.toLowerCase()===username.toLowerCase()})) return{ok:false,error:'Username already exists'};
  if(username.length<3) return{ok:false,error:'Username must be at least 3 characters'};
  if(password.length<6) return{ok:false,error:'Password must be at least 6 characters'};
  users.push({username:username,passwordHash:hashPassword(password),createdAt:new Date().toISOString()});
  saveUsers(users);return{ok:true};
}
function login(username,password){
  var users=getUsers();
  var user=users.find(function(u){return u.username.toLowerCase()===username.toLowerCase()});
  if(!user) return{ok:false,error:'User not found'};
  if(user.passwordHash!==hashPassword(password)) return{ok:false,error:'Incorrect password'};
  saveSession({username:user.username,loginAt:new Date().toISOString()});return{ok:true};
}
function signOut(){lsRemove(STORAGE_KEYS.session);updateAuthUI();closeModal('authModal');closeModal('settingsModal');showToast('Signed out','info')}
function updateAuthUI(){
  var user=getCurrentUser(),avatar=$('userAvatar'),dd=$('userDropdown'),ddAvatar=$('ddAvatar'),ddName=$('ddName'),ddEmail=$('ddEmail'),signInBtn=$('signInBtn'),signOutBtn=$('signOutBtn');
  if(user){
    var initial=user.username.charAt(0).toUpperCase();
    avatar.className='user-avatar';avatar.textContent=initial;
    ddAvatar.textContent=initial;ddName.textContent=user.username;ddEmail.textContent='Signed in';
    signInBtn.style.display='none';signOutBtn.style.display='flex';
  }else{
    avatar.className='user-avatar guest';avatar.textContent='?';
    ddAvatar.textContent='?';ddName.textContent='Guest';ddEmail.textContent='Not signed in';
    signInBtn.style.display='flex';signOutBtn.style.display='none';
  }
}
function openAuthModal(mode){$('authModal').classList.add('open');renderAuthForm(mode||'login')}
function closeModal(id){var el=$(id);if(el)el.classList.remove('open')}
$('authModal').addEventListener('click',function(e){if(e.target===this)closeModal('authModal')});
$('watchPartyModal').addEventListener('click',function(e){if(e.target===this)closeModal('watchPartyModal')});
$('settingsModal').addEventListener('click',function(e){if(e.target===this)closeModal('settingsModal')});
$('movieDetailModal').addEventListener('click',function(e){if(e.target===this)closeModal('movieDetailModal')});
function toggleUserDropdown(){$('userDropdown').classList.toggle('open')}
document.addEventListener('click',function(e){var dd=$('userDropdown'),av=$('userAvatar');if(!dd.contains(e.target)&&!av.contains(e.target))dd.classList.remove('open')});
function renderAuthForm(mode){
  var c=$('authContent');
  if(mode==='login'){
    c.innerHTML='<div class="modal-title">Welcome Back</div><div class="modal-subtitle">Sign in to continue watching</div><div class="form-group"><label class="form-label">Username</label><input class="form-input" type="text" id="loginUser" placeholder="Enter your username" autocomplete="username"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" id="loginPass" placeholder="Enter your password" autocomplete="current-password"></div><div id="loginError" class="form-error" style="display:none"></div><button class="btn btn-primary btn-block" onclick="handleLogin()">Sign In</button><div class="form-footer">Don\'t have an account? <a onclick="renderAuthForm(\'signup\')">Sign Up</a></div>';
    setTimeout(function(){$('loginUser').focus()},100);
  }else{
    c.innerHTML='<div class="modal-title">Create Account</div><div class="modal-subtitle">Join Juggmylittlemovies today</div><div class="form-group"><label class="form-label">Username</label><input class="form-input" type="text" id="signupUser" placeholder="Choose a username" autocomplete="username"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" type="password" id="signupPass" placeholder="Min 6 characters" autocomplete="new-password"></div><div class="form-group"><label class="form-label">Confirm Password</label><input class="form-input" type="password" id="signupPass2" placeholder="Confirm your password" autocomplete="new-password"></div><div id="signupError" class="form-error" style="display:none"></div><button class="btn btn-primary btn-block" onclick="handleSignup()">Create Account</button><div class="form-footer">Already have an account? <a onclick="renderAuthForm(\'login\')">Sign In</a></div>';
    setTimeout(function(){$('signupUser').focus()},100);
  }
}
function handleLogin(){
  var user=$('loginUser').value.trim(),pass=$('loginPass').value,err=$('loginError');
  if(!user||!pass){err.textContent='Please fill in all fields';err.style.display='block';return}
  var result=login(user,pass);
  if(result.ok){updateAuthUI();closeModal('authModal');showToast('Signed in successfully','success')}
  else{err.textContent=result.error;err.style.display='block'}
}
function handleSignup(){
  var user=$('signupUser').value.trim(),pass=$('signupPass').value,pass2=$('signupPass2').value,err=$('signupError');
  if(!user||!pass||!pass2){err.textContent='Please fill in all fields';err.style.display='block';return}
  if(pass!==pass2){err.textContent='Passwords do not match';err.style.display='block';return}
  if(pass.length<6){err.textContent='Password must be at least 6 characters';err.style.display='block';return}
  var result=register(user,pass);
  if(result.ok){login(user,pass);updateAuthUI();closeModal('authModal');showToast('Account created! Welcome!','success')}
  else{err.textContent=result.error;err.style.display='block'}
}
var DEFAULT_SETTINGS={theme:'dark',accent:'violet',fontSize:'medium',quality:'auto',autoplay:true,skipIntro:true,skipIntroSecs:85,subtitles:true,notifyReleases:true,notifyParty:true};
function getSettings(){var s=lsGet(STORAGE_KEYS.settings,{});for(var k in DEFAULT_SETTINGS){if(DEFAULT_SETTINGS.hasOwnProperty(k)&&!(k in s))s[k]=DEFAULT_SETTINGS[k]}return s}
function saveSettings(s){lsSet(STORAGE_KEYS.settings,s);applySettings()}
function applySettings(){
  var s=getSettings();
  document.documentElement.setAttribute('data-theme',s.theme);
  document.documentElement.setAttribute('data-accent',s.accent);
  document.documentElement.setAttribute('data-font',s.fontSize);
}
function openSettings(){
  if(!isLoggedIn()){openAuthModal('login');return}
  $('settingsModal').classList.add('open');renderSettings();
}
function renderSettings(){
  var s=getSettings(),c=$('settingsContent');
  c.innerHTML='<div class="settings-header"><div class="settings-header-left"><div class="settings-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div><span class="wp-title">Settings</span></div><button class="modal-close" style="position:static" onclick="closeModal(\'settingsModal\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="settings-body">'+
    '<div class="settings-section"><div class="settings-section-title">Appearance</div>'+
    '<div class="settings-row"><div><div class="settings-label">Theme</div><div class="settings-desc">Choose your preferred theme</div></div><select class="settings-select" onchange="updateSetting(\'theme\',this.value)"><option value="dark"'+(s.theme==='dark'?' selected':'')+'>Dark</option><option value="amoled"'+(s.theme==='amoled'?' selected':'')+'>AMOLED Black</option><option value="dim"'+(s.theme==='dim'?' selected':'')+'>Dim</option></select></div>'+
    '<div class="settings-row"><div><div class="settings-label">Accent Color</div><div class="settings-desc">Customize the highlight color</div></div><div class="color-swatches">'+
    (function(){var r='';['violet','blue','rose','amber','emerald'].forEach(function(c){r+='<div class="color-swatch swatch-'+c+(s.accent===c?' active':'')+'" onclick="updateSetting(\'accent\',\''+c+'\');this.parentElement.querySelectorAll(\'.color-swatch\').forEach(function(s){s.classList.remove(\'active\')});this.classList.add(\'active\')"></div>'});return r})()+
    '</div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Font Size</div><div class="settings-desc">Adjust text size throughout the app</div></div><div class="font-size-options">'+
    (function(){var r='';['small','medium','large'].forEach(function(f){r+='<button class="font-size-option'+(s.fontSize===f?' active':'')+'" onclick="updateSetting(\'fontSize\',\''+f+'\');this.parentElement.querySelectorAll(\'.font-size-option\').forEach(function(b){b.classList.remove(\'active\')});this.classList.add(\'active\')">'+f.charAt(0).toUpperCase()+f.slice(1)+'</button>'});return r})()+
    '</div></div></div>'+
    '<div class="settings-section"><div class="settings-section-title">Playback</div>'+
    '<div class="settings-row"><div><div class="settings-label">Default Quality</div></div><select class="settings-select" onchange="updateSetting(\'quality\',this.value)"><option value="auto"'+(s.quality==='auto'?' selected':'')+'>Auto</option><option value="1080p"'+(s.quality==='1080p'?' selected':'')+'>1080p</option><option value="720p"'+(s.quality==='720p'?' selected':'')+'>720p</option><option value="480p"'+(s.quality==='480p'?' selected':'')+'>480p</option></select></div>'+
    '<div class="settings-row"><div><div class="settings-label">Autoplay Next Episode</div></div><div class="toggle'+(s.autoplay?' active':'')+'" onclick="toggleSetting(\'autoplay\',this)"><div class="toggle-knob"></div></div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Skip Intro</div></div><div class="toggle'+(s.skipIntro?' active':'')+'" onclick="toggleSetting(\'skipIntro\',this)"><div class="toggle-knob"></div></div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Skip Intro Duration</div><div class="settings-desc">Seconds to auto-skip</div></div><input class="form-input" type="number" style="width:80px;padding:6px 10px;font-size:13px" value="'+s.skipIntroSecs+'" onchange="updateSetting(\'skipIntroSecs\',parseInt(this.value)||85)" min="0" max="300"></div>'+
    '<div class="settings-row"><div><div class="settings-label">Subtitles On by Default</div></div><div class="toggle'+(s.subtitles?' active':'')+'" onclick="toggleSetting(\'subtitles\',this)"><div class="toggle-knob"></div></div></div></div>'+
    '<div class="settings-section"><div class="settings-section-title">Notifications</div>'+
    '<div class="settings-row"><div><div class="settings-label">New Releases</div></div><div class="toggle'+(s.notifyReleases?' active':'')+'" onclick="toggleSetting(\'notifyReleases\',this)"><div class="toggle-knob"></div></div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Watch Party Invites</div></div><div class="toggle'+(s.notifyParty?' active':'')+'" onclick="toggleSetting(\'notifyParty\',this)"><div class="toggle-knob"></div></div></div></div>'+
    '<div class="settings-section"><div class="settings-section-title">Account</div>'+
    '<div class="settings-row"><div><div class="settings-label">Username</div></div><div style="font-size:14px;color:var(--text);font-weight:600">'+esc(getCurrentUser()?.username||'Guest')+'</div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Change Password</div></div><button class="settings-btn settings-btn-ghost" onclick="$(\'pwChangeRow\').style.display=\'flex\'">Change</button></div>'+
    '<div class="settings-row" id="pwChangeRow" style="display:none;flex-direction:column;align-items:stretch;gap:8px">'+
    '<input class="form-input" type="password" id="oldPass" placeholder="Current password" style="font-size:13px">'+
    '<input class="form-input" type="password" id="newPass" placeholder="New password (min 6 chars)" style="font-size:13px">'+
    '<input class="form-input" type="password" id="newPass2" placeholder="Confirm new password" style="font-size:13px">'+
    '<div id="pwError" class="form-error" style="display:none"></div>'+
    '<div style="display:flex;gap:8px"><button class="settings-btn settings-btn-accent" onclick="changePassword()">Save</button><button class="settings-btn settings-btn-ghost" onclick="$(\'pwChangeRow\').style.display=\'none\'">Cancel</button></div></div>'+
    '<div class="settings-row"><div><div class="settings-label">Clear Watch History</div></div><button class="settings-btn settings-btn-danger" onclick="clearHistory()">Clear All</button></div>'+
    '<div class="settings-row" style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px"><div><div class="settings-label" style="color:#EF4444">Sign Out</div></div><button class="settings-btn settings-btn-danger" onclick="signOut();closeModal(\'settingsModal\')">Sign Out</button></div></div></div>';
}
function updateSetting(k,v){var s=getSettings();s[k]=v;saveSettings(s)}
function toggleSetting(k,el){var s=getSettings();s[k]=!s[k];saveSettings(s);el.classList.toggle('active',s[k])}
function changePassword(){
  var old=$('oldPass').value,np=$('newPass').value,np2=$('newPass2').value,err=$('pwError'),user=getCurrentUser();
  if(!user){err.textContent='Not logged in';err.style.display='block';return}
  if(user.passwordHash!==hashPassword(old)){err.textContent='Current password is incorrect';err.style.display='block';return}
  if(np.length<6){err.textContent='New password must be at least 6 characters';err.style.display='block';return}
  if(np!==np2){err.textContent='Passwords do not match';err.style.display='block';return}
  var users=getUsers(),idx=users.findIndex(function(u){return u.username===user.username});
  if(idx<0){err.textContent='User not found';err.style.display='block';return}
  users[idx].passwordHash=hashPassword(np);saveUsers(users);
  $('pwChangeRow').style.display='none';showToast('Password changed successfully','success');
}
function clearHistory(){if(confirm('Are you sure you want to clear all watch history?')){lsRemove(STORAGE_KEYS.continueWatching);lsRemove(STORAGE_KEYS.history);renderHome();showToast('Watch history cleared','info')}}
var wpState={inRoom:false,roomCode:null,users:[],selectedMovie:null,isPlaying:false,seekTime:0,isHost:false,lastProcessedTime:0,lastActionTime:0};
var WP_PREFIX='watchparty_';
var wpSyncInterval=null;function openWatchParty(){
  if(!isLoggedIn()){openAuthModal('login');return}
  $('watchPartyModal').classList.add('open');renderWPLobby()
}
function closeWP(){closeModal('watchPartyModal');stopWPSync();wpState={inRoom:false,roomCode:null,users:[],selectedMovie:null,isPlaying:false,seekTime:0,isHost:false,lastProcessedTime:0,lastActionTime:0}}
function renderWPLobby(){
  $('wpContent').innerHTML='<div class="wp-header"><div class="wp-header-left"><div class="wp-icon">🎉</div><span class="wp-title">Watch Party</span></div><button class="modal-close" style="position:static" onclick="closeWP()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="wp-body"><div class="wp-lobby"><h3>Watch Together</h3><p>Create a room or join an existing one to watch movies in sync with friends.</p><div class="wp-btn-group"><button class="btn btn-primary" onclick="createRoom()">🎉 Create Room</button><button class="btn btn-secondary" onclick="showJoinRoom()">🔗 Join Room</button></div><div id="joinRoomSection" style="display:none;margin-top:16px"><div class="wp-room-input"><input type="text" id="roomCodeInput" placeholder="Enter room code" maxlength="6" oninput="this.value=this.value.toUpperCase()"><button class="btn btn-primary" onclick="joinRoom()">Join</button></div></div></div></div>'
}
function showJoinRoom(){$('joinRoomSection').style.display='block';setTimeout(function(){$('roomCodeInput').focus()},100)}
function createRoom(){
  var code=Math.random().toString(36).substring(2,8).toUpperCase();
  wpState.inRoom=true;wpState.roomCode=code;wpState.isHost=true;wpState.users=[{id:'host',name:(getCurrentUser()||{username:'You'}).username,isHost:true}];
  lsSet(WP_PREFIX+code,{users:wpState.users});renderWPRoom()
}
function joinRoom(){
  var code=$('roomCodeInput').value.trim().toUpperCase();
  if(code.length!==6){showToast('Please enter a valid 6-digit code','error');return}
  var roomData=lsGet(WP_PREFIX+code);
  if(!roomData){showToast('Room not found. Check the code.','error');return}
  wpState.inRoom=true;wpState.roomCode=code;wpState.isHost=false;
  var users=roomData.users||[];var myName=(getCurrentUser()||{username:'Anonymous'}).username;
  if(!users.find(function(u){return u.name===myName})){users.push({id:'user_'+Date.now(),name:myName,isHost:false});lsSet(WP_PREFIX+code,{users:users})}
  wpState.users=users;renderWPRoom()
}
function leaveRoom(){
  if(wpState.roomCode){
    var data=lsGet(WP_PREFIX+wpState.roomCode);var myName=(getCurrentUser()||{username:'Anonymous'}).username;
    if(data){data.users=(data.users||[]).filter(function(u){return u.name!==myName});if(data.users.length===0)lsRemove(WP_PREFIX+wpState.roomCode);else lsSet(WP_PREFIX+wpState.roomCode,data)}
  }
  closeWP()
}
function renderWPRoom(){
  var c=$('wpContent'),user=getCurrentUser(),myName=user?user.username:'Anonymous';
  c.innerHTML='<div class="wp-header"><div class="wp-header-left"><div class="wp-icon">🎉</div><span class="wp-title">Watch Party</span></div><div style="display:flex;align-items:center;gap:8px"><button class="btn btn-sm btn-ghost" onclick="leaveRoom()" style="color:#EF4444">Leave</button><button class="modal-close" style="position:static" onclick="closeWP()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div><div class="wp-body"><div class="wp-room-display"><span style="font-size:12px;color:var(--text-muted)">Room Code</span><div class="wp-room-code">'+esc(wpState.roomCode)+'</div><div class="wp-room-actions"><button onclick="copyRoomCode()" title="Copy code"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div></div><div class="wp-room"><div class="wp-player"><div class="wp-player-video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg><span id="wpNowPlaying">'+(wpState.selectedMovie?esc(wpState.selectedMovie.title):'No movie selected')+'</span></div><div class="wp-progress"><div class="wp-progress-bar" id="wpProgressBar"></div></div><div class="wp-player-info"><div class="wp-player-title" id="wpPlayerTitle">'+(wpState.selectedMovie?esc(wpState.selectedMovie.title):'Select a movie to watch')+'</div><div class="wp-sync-badge live" id="wpSyncBadge">🔴 LIVE SYNC</div></div><div class="wp-controls"><button onclick="wpPlay()" id="wpPlayBtn"'+(wpState.selectedMovie?'':' disabled')+'>▶ Play</button><button onclick="wpPause()" id="wpP... (line truncated to 2000 chars)
  startWPSync();
}
function filterWPMovies(q){
  var items=$('wpMovieList').querySelectorAll('.wp-picker-item');
  items.forEach(function(item){var title=item.querySelector('.wp-picker-item-title').textContent.toLowerCase();item.style.display=title.indexOf(q.toLowerCase())>-1?'flex':'none'})
}
function selectWPMovie(id){
  var movie=MOVIE_PICKER_ITEMS.find(function(m){return m.id===id});if(!movie)return;
  wpState.selectedMovie=movie;
  qsa('.wp-picker-item').forEach(function(el){el.classList.toggle('active',parseInt(el.dataset.id)===id)});
  var titleEl=$('wpPlayerTitle');if(titleEl)titleEl.textContent=movie.title;
  var nowEl=$('wpNowPlaying');if(nowEl)nowEl.textContent=movie.title;
  var playBtn=$('wpPlayBtn');if(playBtn)playBtn.disabled=false;var pauseBtn=$('wpPauseBtn');if(pauseBtn)pauseBtn.disabled=false;
  broadcastWPAction('select',movie);
}
function wpPlay(){if(!wpState.selectedMovie)return;wpState.isPlaying=true;broadcastWPAction('play');var b=$('wpPlayBtn');if(b)b.textContent='▶ Playing...'}
function wpPause(){if(!wpState.selectedMovie)return;wpState.isPlaying=false;broadcastWPAction('pause');var b=$('wpPauseBtn');if(b)b.textContent='⏸ Paused'}
function broadcastWPAction(action,data){
  if(!wpState.roomCode)return;
  var key=WP_PREFIX+wpState.roomCode,roomData=lsGet(key,{users:wpState.users});
  var entry={action:action,timestamp:Date.now(),user:(getCurrentUser()||{username:'Anonymous'}).username,data:data};
  var history=roomData.history||[];history.push(entry);if(history.length>100)history.splice(0,history.length-100);
  lsSet(key,{users:roomData.users,history:history,lastAction:entry});
  wpState.lastActionTime=Date.now();
}
function startWPSync(){stopWPSync();wpSyncInterval=setInterval(checkWPSync,500)}
function stopWPSync(){if(wpSyncInterval){clearInterval(wpSyncInterval);wpSyncInterval=null}}
function checkWPSync(){
  if(!wpState.inRoom||!wpState.roomCode)return;
  var key=WP_PREFIX+wpState.roomCode,roomData=lsGet(key);if(!roomData)return;
  if(roomData.users){
    var myName=(getCurrentUser()||{username:'Anonymous'}).username;
    var existingUs=wpState.users;
    roomData.users.forEach(function(nu){if(!existingUs.find(function(u){return u.name===nu.name}))existingUs.push(nu)});
    wpState.users=existingUs.filter(function(u){return roomData.users.find(function(ru){return ru.name===u.name})});
    var peopleEl=$('wpPeopleList');
    if(peopleEl)peopleEl.innerHTML=wpState.users.map(function(u){return'<div class="wp-person"><div class="wp-person-avatar">'+u.name.charAt(0).toUpperCase()+'</div><div class="wp-person-name">'+esc(u.name)+(u.name===myName?' <span style="color:var(--accent);font-size:11px">(you)</span>':'')+'</div>'+(u.isHost?'<span class="wp-person-host">HOST</span>':'')+'</div>'}).join('');
  }
  if(roomData.lastAction&&(!wpState.lastProcessedTime||roomData.lastAction.timestamp>wpState.lastProcessedTime)){
    var action=roomData.lastAction,isSelf=action.user===(getCurrentUser()||{username:''}).username;
    if(!isSelf){
      if(action.action==='play'){wpState.isPlaying=true;var b=$('wpPlayBtn');if(b)b.textContent='▶ Playing...';var badge=$('wpSyncBadge');if(badge){badge.className='wp-sync-badge live';badge.textContent='🔴 LIVE SYNC'}}
      else if(action.action==='pause'){wpState.isPlaying=false;var b=$('wpPauseBtn');if(b)b.textContent='⏸ Paused';var badge=$('wpSyncBadge');if(badge){badge.className='wp-sync-badge live';badge.textContent='🔴 LIVE SYNC'}}
      else if(action.action==='select'&&action.data){
        var movie=MOVIE_PICKER_ITEMS.find(function(m){return m.id===action.data.id});
        if(movie){wpState.selectedMovie=movie;qsa('.wp-picker-item').forEach(function(el){el.classList.toggle('active',parseInt(el.dataset.id)===movie.id)});var ttl=$('wpPlayerTitle');if(ttl)ttl.textContent=movie.title;var nowEl=$('wpNowPlaying');if(nowEl)nowEl.textContent=movie.title;var playBtn=$('wpPlayBtn');if(playBtn)playBtn.disabled=false;var pauseBtn=$('wpPauseBtn');if(pauseBtn)pauseBtn.disabled=false}
      }
    }
    wpState.lastProcessedTime=action.timestamp;
  }
  var bar=$('wpProgressBar');
  if(bar&&wpState.isPlaying&&wpState.selectedMovie){var current=parseFloat(bar.style.width)||0;if(current<100)bar.style.width=Math.min(current+0.3,100)+'%'}
}
window.addEventListener('storage',function(e){if(wpState.roomCode&&e.key===WP_PREFIX+wpState.roomCode)checkWPSync()});
function copyRoomCode(){if(wpState.roomCode){navigator.clipboard.writeText(wpState.roomCode).then(function(){showToast('Room code copied!','success')})['catch'](function(){showToast('Failed to copy','error')})}}var heroInterval=null,heroCurrent=0,heroMovies=[];

function openMovieDetail(id) {
  var movie = MOCK_MOVIES.find(function(m){return m.id===id}) || MOCK_TV.find(function(m){return m.id===id});
  if (!movie) return;
  var title = movie.title || movie.name || 'Untitled';
  var year = (movie.release_date || movie.first_air_date || '').split('-')[0];
  var rating = formatRating(movie.vote_average);
  var overview = movie.overview || 'No description available.';
  var genres = (movie.genre_ids || []).map(function(id){return GENRE_NAMES[id]}).filter(Boolean);
  var isMovie = !!movie.title;
  var c = $('movieDetailContent');
  c.innerHTML = '<div class="detail-header"><button class="modal-close" style="position:static" onclick="closeModal(\'movieDetailModal\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
    '<div class="detail-backdrop"><img src="'+getBackdropUrl(movie.backdrop_path)+'" alt="'+esc(title)+'" /></div>' +
    '<div class="detail-body">' +
    '<div class="detail-poster"><img src="'+getImageUrl(movie.poster_path,'w342')+'" alt="'+esc(title)+'" /></div>' +
    '<div class="detail-info">' +
    '<h2 class="detail-title">'+esc(title)+'</h2>' +
    '<div class="detail-meta">' +
    '<span class="detail-rating"><svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> '+rating+'</span>' +
    (year ? '<span class="detail-year">'+esc(year)+'</span>' : '') +
    '<span class="detail-type">'+(isMovie?'Movie':'Series')+'</span>' +
    '</div>' +
    (genres.length ? '<div class="detail-genres">'+genres.map(function(g){return '<span class="detail-genre">'+esc(g)+'</span>'}).join('')+'</div>' : '') +
    '<p class="detail-desc">'+esc(overview)+'</p>' +
    '<div class="detail-actions">' +
    '<button class="btn btn-primary" onclick="addToContinue('+id+');closeModal(\'movieDetailModal\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play Now</button>' +
    '<button class="btn btn-secondary" onclick="showToast(\'Added to watchlist\',\'info\');closeModal(\'movieDetailModal\')">+ Watchlist</button>' +
    '</div></div></div>';
  $('movieDetailModal').classList.add('open');
}

function renderHome() {
  heroMovies=MOCK_MOVIES.slice(0,5);heroCurrent=0;renderHero();
  var c=$('contentRows'),continueItems=getContinueWatching(),html='';
  if(continueItems.length>0){
    html+='<div class="section"><div class="section-header"><div class="section-title-group"><div class="section-accent"></div><span class="section-title">Continue Watching</span></div></div><div class="row-scroll" id="continueRow">';
    continueItems.forEach(function(item,i){
      var pct=item.duration>0?Math.min((item.progress/item.duration)*100,100):0;
      html+='<div class="movie-card" style="width:220px;opacity:1;transform:none"><div class="movie-card-inner" style="aspect-ratio:16/10"><img class="movie-poster" src="'+getImageUrl(item.poster,'w342')+'" alt="'+esc(item.title)+'" loading="lazy"><div class="movie-card-gradient"></div><div class="movie-card-hover"><div class="movie-card-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="movie-card-bottom"><div class="movie-card-title">'+esc(item.title)+'</div></div><div class="movie-card-progress"><div class="movie-card-progress-bar" style="width:'+pct+'%"></div></div>'+(item.duration>0?'<div style="position:absolute;top:8px;right:8px;z-index:2;padding:3px 6px;background:rgba(0,0,0,0.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:4px;border:1px solid rgba(255,255,255,0.06);font-size:10px;font-weight:600;color:var(--text-secondary)">'+formatTime(item.duration-item.progress)+'</div>':'')+'</div></div>'
    });
    html+='</div></div>'
  }else{
    html+='<div class="section"><div class="section-header"><div class="section-title-group"><div class="section-accent"></div><span class="section-title">Continue Watching</span></div></div><div class="continue-empty"><svg class="continue-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg><span class="continue-empty-text">Start watching a movie and it will show up here</span></div></div>'
  }
  var rows=[{title:'Trending Now',movies:MOCK_MOVIES.slice(0,10),tag:'Featured'},{title:'Popular',movies:MOCK_MOVIES.slice(5,15)},{title:'Top Rated',movies:MOCK_MOVIES.slice(2,12)},{title:'TV Shows',movies:MOCK_TV.slice(0,5)}];
  rows.forEach(function(row,ri){
    html+='<div class="section"><div class="section-header"><div class="section-title-group"><div class="section-accent"></div><span class="section-title">'+esc(row.title)+'</span>'+(row.tag?'<span class="section-tag">'+esc(row.tag)+'</span>':'')+'</div><div class="section-controls"><button class="section-arrow" onclick="scrollRow(this,-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button><button class="section-arrow" onclick="scrollRow(this,1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button></div></div><div class="row-scroll" data-row="'+ri+'">';
    row.movies.forEach(function(m,i){
      var title=m.title||m.name||'Untitled',year=(m.release_date||m.first_air_date||'').split('-')[0],rating=formatRating(m.vote_average);
      html+='<div class="movie-card" data-delay="'+(i*50)+'" onclick="openMovieDetail('+m.id+')"><div class="movie-card-inner"><img class="movie-poster" src="'+getImageUrl(m.poster_path,'w342')+'" alt="'+esc(title)+'" loading="lazy"><div class="movie-card-gradient"></div><div class="movie-card-hover"><div class="movie-card-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="movie-card-top"><div class="movie-card-rating"><svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+rating+'</div>'+(year?'<div class="movie-card-year">'+esc(year)+'</div>':'')+'</div><div class="movie-card-bottom"><div class="movie-card-title">'+esc(title)+'</div></div></div></div>'
    });
    html+='</div></div>'
  });
  c.innerHTML=html;observeCards()
}
function scrollRow(btn,dir){var row=btn.closest('.section').querySelector('.row-scroll');if(row)row.scrollBy({left:dir*row.clientWidth*0.75,behavior:'smooth'})}
function observeCards(){
  if(window.obs)window.obs.disconnect();
  window.obs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry,i){
      if(entry.isIntersecting){
        var delay=parseInt(entry.target.dataset.delay)||0;
        setTimeout(function(){entry.target.classList.add('visible')},delay);
        window.obs.unobserve(entry.target)
      }
    })
  },{rootMargin:'50px'});
  qsa('.movie-card').forEach(function(el){window.obs.observe(el)})
}
function renderHero(){
  var container=$('heroSlides'),content=$('heroContent'),dots=$('heroDots');
  if(!heroMovies.length){container.innerHTML='';content.innerHTML='';dots.innerHTML='';return}
  container.innerHTML=heroMovies.map(function(m,i){return'<div class="hero-slide'+(i===0?' active':'')+'" data-idx="'+i+'"><img class="hero-bg" src="'+getBackdropUrl(m.backdrop_path)+'" alt="" loading="'+(i===0?'eager':'lazy')+'"></div>'}).join('');
  content.innerHTML=heroMovies.map(function(m,i){return renderHeroContent(m,i)}).join('');
  dots.innerHTML=heroMovies.map(function(m,i){return'<button class="hero-dot'+(i===0?' active':'')+'" onclick="goHero('+i+')"></button>'}).join('');
  if(heroInterval)clearInterval(heroInterval);heroInterval=setInterval(nextHero,7000)
}
function renderHeroContent(m,i){
  var title=m.title||m.name||'Untitled',year=(m.release_date||m.first_air_date||'').split('-')[0],rating=formatRating(m.vote_average);
  var genres=(m.genre_ids||[]).slice(0,2).map(function(id){return GENRE_NAMES[id]}).filter(Boolean);
  return '<div class="hero-content-inner" data-idx="'+i+'" style="display:'+(i===0?'block':'none')+'"><div class="hero-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'+(m.title?'Movie':'Series')+'</div><h1 class="hero-title">'+esc(title)+'</h1><div class="hero-meta"><div class="hero-meta-star"><svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+rating+'</div>'+(year?'<span class="hero-meta-year">'+esc(year)+'</span>':'')+genres.map(function(g){return'<span class="hero-meta-tag">'+esc(g)+'</span>'}).join('')+'</div><p class="hero-desc">'+esc(m.overview)+'</p><div class="hero-actions"><button class="btn btn-primary" onclick="openMovieDetail('+m.id+')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Play Now</button><button class="btn btn-secondary" onclick="openMovieDetail('+m.id+')">More Info</button></div></div>'
}
function goHero(idx){if(!heroMovies.length)return;heroCurrent=idx;updateHeroSlides();if(heroInterval){clearInterval(heroInterval);heroInterval=setInterval(nextHero,7000)}}
function nextHero(){if(heroMovies.length)goHero((heroCurrent+1)%heroMovies.length)}
function prevHero(){if(heroMovies.length)goHero((heroCurrent-1+heroMovies.length)%heroMovies.length)}
function updateHeroSlides(){qsa('.hero-slide').forEach(function(s){s.classList.toggle('active',parseInt(s.dataset.idx)===heroCurrent)});qsa('.hero-content-inner').forEach(function(s){s.style.display=parseInt(s.dataset.idx)===heroCurrent?'block':'none'});qsa('.hero-dot').forEach(function(s){s.classList.toggle('active',parseInt(s.dataset.idx)===heroCurrent)})}
function addToContinue(id){var m=MOCK_MOVIES.find(function(m){return m.id===id})||MOCK_TV.find(function(m){return m.id===id});if(!m)return;var cw=getContinueWatching();if(!cw.find(function(i){return i.id===id})){cw.unshift({id:id,title:m.title||m.name||'Untitled',poster:m.poster_path,progress:0,duration:7200});if(cw.length>20)cw.pop();lsSet(STORAGE_KEYS.continueWatching,cw);showToast('Now playing: '+esc(m.title||m.name),'success');renderHome()}}
function switchPage(page){
  qsa('.nav-item').forEach(function(n){n.classList.remove('active')});
  var el=qs('.nav-item[data-page="'+page+'"]');if(el)el.classList.add('active');
  if(window.innerWidth<=768){$('sidebar').classList.remove('mobile-open')}
  var content=$('contentRows');
  if(page==='home')renderHome();
  else if(page==='search'){content.innerHTML='<div class="section"><div class="section-header" style="padding-top:16px"><div class="section-title-group"><div class="section-accent"></div><span class="section-title">Search</span></div></div><input class="form-input" type="text" placeholder="Type to search..." oninput="handleSearch(this.value)" style="margin-bottom:16px;max-width:400px" id="searchInput" autofocus><div id="searchResults"></div></div>';setTimeout(function(){var si=$('searchInput');if(si)si.focus()},100)}
  else if(page==='trending'){content.innerHTML='<div class="section-title" style="padding:16px 0">Trending</div>'+renderMovieGrid(MOCK_MOVIES)}
  else if(page==='movies'){content.innerHTML='<div class="section-title" style="padding:16px 0">Movies</div>'+renderMovieGrid(MOCK_MOVIES)}
  else if(page==='tvshows'){content.innerHTML='<div class="section-title" style="padding:16px 0">TV Shows</div>'+renderMovieGrid(MOCK_TV)}
  else if(page==='anime'){content.innerHTML='<div class="section-title" style="padding:16px 0">Anime</div><div style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px">Anime content coming soon...</div>'}
  else if(page==='live'){content.innerHTML='<div class="section-title" style="padding:16px 0">Live TV</div><div style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px">Live channels coming soon...</div>'}
  else if(page==='ufc'){content.innerHTML='<div class="section-title" style="padding:16px 0">UFC</div><div style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px">UFC events coming soon...</div>'}
  else if(page==='watchlist')renderWatchlist();
  else if(page==='history')renderHistory();
  else if(page==='legal'){content.innerHTML='<div style="padding:24px 0"><div class="section-title" style="margin-bottom:16px">Legal / DMCA</div><p style="color:var(--text-secondary);font-size:14px;line-height:1.8">This is a private streaming platform. All content is sourced from third-party providers. If you believe any content infringes your copyright, please contact us with the relevant details and we will remove it promptly.</p></div>'}
  $('scrollContent').scrollTop=0
}
function handleSearch(q){
  if(!q.trim()){var sr=$('searchResults');if(sr)sr.innerHTML='';return}
  var results=MOCK_MOVIES.filter(function(m){return m.title.toLowerCase().indexOf(q.toLowerCase())>-1}).concat(MOCK_TV.filter(function(m){return(m.title||m.name).toLowerCase().indexOf(q.toLowerCase())>-1}));
  var sr=$('searchResults');if(!sr)return;
  if(results.length)sr.innerHTML='<div class="section-title" style="padding:8px 0;font-size:13px;color:var(--text-secondary);margin-bottom:8px">Found '+results.length+' result'+(results.length!==1?'s':'')+'</div>'+renderMovieGrid(results);
  else sr.innerHTML='<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:14px">No results found for &ldquo;'+esc(q)+'&rdquo;</div>'
}
function renderMovieGrid(movies){
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;padding:12px 0">'+movies.map(function(m){
    var title=m.title||m.name||'Untitled',year=(m.release_date||m.first_air_date||'').split('-')[0],rating=formatRating(m.vote_average);
    return '<div class="movie-card visible" style="width:auto" onclick="openMovieDetail('+m.id+')"><div class="movie-card-inner"><img class="movie-poster" src="'+getImageUrl(m.poster_path,'w342')+'" alt="'+esc(title)+'" loading="lazy"><div class="movie-card-gradient"></div><div class="movie-card-hover"><div class="movie-card-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="movie-card-top"><div class="movie-card-rating"><svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'+rating+'</div>'+(year?'<div class="movie-card-year">'+esc(year)+'</div>':'')+'</div><div class="movie-card-bottom"><div class="movie-card-title">'+esc(title)+'</div></div></div></div>'
  }).join('')+'</div>'
}
function getWatchlist(){return lsGet(STORAGE_KEYS.watchlist,[])}
function getContinueWatching(){return lsGet(STORAGE_KEYS.continueWatching,[])}
function renderWatchlist(){
  var items=getWatchlist(),c=$('contentRows');
  c.innerHTML='<div class="section-title" style="padding:16px 0">Watchlist</div>';
  if(!items.length)c.innerHTML+='<div class="continue-empty"><svg class="continue-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span class="continue-empty-text">Your watchlist is empty. Add movies to keep track of what to watch.</span></div>';
  else c.innerHTML+=renderMovieGrid(items);
}
function renderHistory(){
  var items=getContinueWatching(),c=$('contentRows');
  c.innerHTML='<div class="section-title" style="padding:16px 0">Watch History</div>';
  if(!items.length)c.innerHTML+='<div class="continue-empty"><svg class="continue-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="continue-empty-text">No watch history yet. Start watching something!</span></div>';
  else c.innerHTML+=renderMovieGrid(items);
}
var toastTimeout=null;
function showToast(msg,type){
  var t=$('toast');if(!t)return;t.textContent=msg;t.className='toast '+(type||'info')+' show';
  if(toastTimeout)clearTimeout(toastTimeout);
  toastTimeout=setTimeout(function(){t.classList.remove('show')},3000)
}

function initApp() {
  applySettings();
  updateAuthUI();
  renderHome();
}
window.initApp = initApp;
