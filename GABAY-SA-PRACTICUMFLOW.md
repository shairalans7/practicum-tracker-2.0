# Gabay sa PracticumFlow Version 2

Ang dokumentong ito ay gabay sa paggamit ng PracticumFlow, pagpapatakbo nito sa ibang laptop, at pag-a-update ng website.

## Mga link

- Live website: <https://shairalans7.github.io/practicum-tracker-2.0/>
- GitHub repository: <https://github.com/shairalans7/practicum-tracker-2.0>
- Firebase project ID: `practicum2-c2164`

## Paano gumagana ang system

- **GitHub Pages** ang nagho-host ng website files.
- **Firebase Authentication** ang namamahala sa accounts, email verification, at password reset.
- **Cloud Firestore** ang nag-iimbak ng profiles, shift records, at activity logs sa live website.
- **Browser localStorage** ang database sa `localhost` demo mode. Walang Firebase o internet na kailangan para sa local mode.
- **Firestore Rules** ang naglilimita sa bawat user sa sarili niyang data.
- **Light/dark mode** preference ay sine-save sa browser na ginagamit mo. Hindi ito Firebase data.

Ang live website ay gumagamit ng Firebase cloud data. Ang `localhost` demo mode ay hiwalay at nagse-save sa browser storage lang. Hindi pareho ang local account at live Firebase account, at hindi awtomatikong nagsi-sync ang local records sa cloud.

## Paggamit ng website

### Gumawa at mag-verify ng account

1. Buksan ang live website at piliin ang paggawa ng account. Sa localhost, gagawa ito ng hiwalay na local demo account.
2. Ilagay ang pangalan, email address, at password.
3. Sa live website, buksan ang verification email at pindutin ang link. Kung wala sa Inbox, tingnan ang Spam, Promotions, at All Mail. Walang email verification sa local demo mode.
4. Bumalik sa website at mag-sign in. Kung hindi pa verified ang account, susubukan ng app na magpadala ulit ng verification link.

Kung may error, kopyahin ang mismong mensahe. Huwag ibahagi ang password mo.

### Magtala ng oras

1. Pindutin ang **Clock In** sa pagsisimula ng practicum.
2. Pindutin ang **Clock Out** sa pagtatapos. Dito isinasara ang shift at kinukuwenta ang tagal nito.
3. Ang dashboard progress ay nakabatay sa mga shift na na-clock out na. Kapag nakalimutan ang Clock Out, maaaring manatiling aktibo ang shift hanggang maisara ito.

### Magdagdag ng activity

Itala ang task title, task type, tagal, petsa, at notes. Hiwalay ang activity log sa shift time: ang oras ng activity ay ginagamit sa activity chart at report, samantalang ang Clock In/Clock Out ang ginagamit sa kabuuang practicum hours.

### Chart, report, at settings

- Ipinapakita ng competency chart ang bahagdan ng activity time sa bawat kategorya.
- Sa report view, pumili ng petsa para makita ang mga activity sa araw na iyon. Gamitin ang print option ng browser kung gusto itong i-save bilang PDF.
- Sa settings, maaaring baguhin ang practicum hours target, oras na kailangan bawat araw, at timezone.
- Gamitin ang switch sa kanang ibabang bahagi para magpalit ng light at dark mode. Naaalala ng browser ang pinili mong mode.

## Pagpapatakbo sa laptop o localhost

### Kopyahin ang repository

Kung naka-install ang Git, buksan ang PowerShell sa folder kung saan ilalagay ang project at patakbuhin:

```powershell
git clone https://github.com/shairalans7/practicum-tracker-2.0.git
cd practicum-tracker-2.0
```

Kung wala kang Git, buksan ang repository sa GitHub, piliin ang **Code → Download ZIP**, i-extract ito, at buksan ang PowerShell sa na-extract na folder.

### Simulan ang local web server

Sa project folder, patakbuhin:

```powershell
py -m http.server 8000
```

Kung hindi gumana ang `py`, subukan:

```powershell
python -m http.server 8000
```

Buksan ang <http://localhost:8000/> sa browser. Huwag buksan ang `index.html` sa pamamagitan ng pag-double-click; kailangan ang `http://` local server para gumana nang tama ang JavaScript modules. Hindi kailangan ang `npm install` para patakbuhin ang demo.

Iwanang bukas ang PowerShell habang ginagamit ang website. Pindutin ang **Ctrl + C** sa PowerShell para ihinto ang server.

### Gumamit ng localStorage mode

Kapag ang site ay binuksan sa `http://localhost:8000/` o `http://127.0.0.1:8000/`, awtomatikong localStorage ang backend. Hindi kailangan idagdag ang `localhost` sa Firebase Authorized Domains para sa mode na ito.

Gumawa ng local demo account sa unang pagbukas; hindi gagana rito ang Firebase account mo. Gumamit ng demo password, hindi password ng Firebase account mo. Naka-save ang account at records sa browser na iyon. Gamitin ang parehong browser at address para makita ulit ang records. Kapag binura ang browser site data, mabubura rin ang local demo data. Hindi gumagana ang pagpapadala ng password reset email sa local-only mode.

Para makita ang cloud account at cloud records, gamitin ang live GitHub Pages website habang may internet.

## Firebase setup at rules

Sa Firebase Console, kumpirmahing:

1. Naka-enable ang **Email/Password** sa **Authentication → Sign-in method**.
2. May Firestore database ang project.
3. Kasama sa **Authentication → Settings → Authorized domains** ang `shairalans7.github.io` para sa live website. Hindi ginagamit ang Firebase Auth sa localhost demo mode.
4. Nailathala sa **Firestore Database → Rules** ang laman ng [firestore.rules](firestore.rules).

> Hiwalay ang pag-publish ng Firestore Rules sa pag-deploy ng website. Kapag binago ang `firestore.rules`, kailangang i-publish muli ito sa Firebase Console. Hindi ito ginagawa ng GitHub Pages workflow.

## Pag-publish ng code updates

Mula sa project folder, pagkatapos gumawa ng pagbabago, patakbuhin:

```powershell
git add .
git commit -m "Describe the change"
git push origin main
```

> Pagkatapos mag-push, tingnan ang **GitHub repository → Actions → Deploy to GitHub Pages**. Hintaying maging successful ang deployment bago i-refresh ang live site gamit ang **Ctrl + Shift + R**.

Para kumuha ng pinakabagong code sa laptop pagkatapos gumawa ng pagbabago sa GitHub:

```powershell
git pull origin main
```

## Mahahalagang files

- `index.html` at `login.html` — entry pages ng app.
- `assets/firebase-config.js` — Firebase web app configuration.
- `assets/firebase.js` — nag-i-initialize ng Firebase Authentication at Firestore.
- `assets/firebase-bootstrap.js` — pumipili ng local o Firebase backend ayon sa hostname.
- `assets/local-storage-backend.js` — local demo accounts at records para sa localhost.
- `assets/firebase-online.js` — Firebase Authentication at Firestore operations para sa live site.
- `assets/theme.js` at `assets/theme.css` — light/dark mode at itsura nito.
- `assets/index-B_b0rHmn.js` at `assets/index--yB6-8HE.css` — compiled UI assets.
- `firestore.rules` — mga patakaran sa pagbasa at pagsulat ng Firestore data.
- `.github/workflows/pages.yml` — awtomatikong pag-deploy sa GitHub Pages.

Huwag ilagay sa GitHub ang passwords o Firebase service-account private keys. Ang Firebase web `apiKey` ay bahagi ng client configuration; ang seguridad ng user data ay dapat manggaling sa Authentication at Firestore Rules.
