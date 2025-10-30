# 📚 PANDUAN EDIT & TAMBAH SOALAN

## 📍 Lokasi Soalan
File: `kuizsejarahtahun6.html`
Line: **310 - 365**

---

## 🔢 Index Bermula dari 0 (PENTING!)

```
choices: ["A", "B", "C", "D"]
           0    1    2    3

correct: 0  →  Jawapan A (yang pertama)
correct: 1  →  Jawapan B (yang kedua)
correct: 2  →  Jawapan C (yang ketiga)
correct: 3  →  Jawapan D (yang keempat)
```

---

## 📝 3 Format Soalan

### FORMAT 1: MCQ Biasa (4 Pilihan)
```javascript
{
    type: "mcq",
    question: "Apakah ibu negara Malaysia?",
    choices: ["Johor Bahru", "Putrajaya", "Kuala Lumpur", "Shah Alam"],
    correct: 2
},
```

### FORMAT 2: MCQ dengan Items (I, II, III, IV)
```javascript
{
    type: "mcq",
    question: "Antara berikut, yang manakah negeri di Pantai Timur?",
    items: ["Kelantan", "Selangor", "Terengganu", "Kedah"],
    choices: ["I dan II", "I dan III", "II dan IV", "III dan IV"],
    correct: 1,
    hasItems: true
},
```

### FORMAT 3: True/False (2 Pilihan)
```javascript
{
    type: "mcq",
    question: "Kuala Lumpur adalah ibu negara Malaysia.",
    choices: ["Betul", "Salah"],
    correct: 0
},
```

---

## ✏️ Cara Edit Soalan Sedia Ada

1. **Buka** `kuizsejarahtahun6.html` dalam text editor
2. **Cari** `let QUESTIONS = [` (Line 310)
3. **Scroll** ke soalan yang nak edit
4. **Edit** text dalam:
   - `question: "..."` ← Soalan
   - `choices: ["A", "B", "C", "D"]` ← Pilihan
   - `correct: X` ← Index jawapan betul (0, 1, 2, atau 3)
5. **Save** file (Ctrl+S)

**Contoh Edit:**

SEBELUM:
```javascript
{ type: "mcq", question: "Apakah ibu negara lama?", choices: ["A", "B", "C", "D"], correct: 0 },
```

SELEPAS:
```javascript
{ type: "mcq", question: "Apakah ibu negara Malaysia?", choices: ["Johor", "Putrajaya", "Kuala Lumpur", "Melaka"], correct: 2 },
```

---

## ➕ Cara Tambah Soalan Baru

### STEP 1: Pergi ke akhir senarai soalan (sebelum `];`)

```javascript
let QUESTIONS = [
    { type: "mcq", question: "...", choices: [...], correct: 0 },
    { type: "mcq", question: "...", choices: [...], correct: 1 },
    // ... soalan sedia ada ...
    { type: "mcq", question: "Soalan terakhir?", choices: ["A", "B", "C", "D"], correct: 0 }
    // ⬆️ PASTIKAN ADA COMMA DI SINI! ⬆️
];
```

### STEP 2: Tambah soalan baru SEBELUM `];`

```javascript
let QUESTIONS = [
    { type: "mcq", question: "...", choices: [...], correct: 0 },
    // ... soalan sedia ada ...
    { type: "mcq", question: "Soalan terakhir lama?", choices: ["A", "B", "C", "D"], correct: 0 },
    // ⬇️ SOALAN BARU DI BAWAH ⬇️
    { type: "mcq", question: "Apakah nama lain bagi Pulau Pinang?", choices: ["Pearl Island", "Prince of Wales Island", "Langkawi", "Penang Hill"], correct: 1 }
    // ⬆️ SOALAN TERAKHIR TAK PERLU COMMA ⬆️
];
```

**⚠️ PENTING:**
- Semua soalan kena ada **comma (,)** di akhir, KECUALI soalan terakhir
- Check **syntax**: bracket `[]`, curly braces `{}`, quotes `""`

---

## 📋 Template Copy & Paste

### Template MCQ Biasa:
```javascript
{ type: "mcq", question: "SOALAN ANDA?", choices: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"], correct: 0 },
```

### Template MCQ Items:
```javascript
{ type: "mcq", question: "SOALAN ANDA?", items: ["Item I", "Item II", "Item III", "Item IV"], choices: ["I dan II", "I dan IV", "II dan III", "III dan IV"], correct: 0, hasItems: true },
```

### Template True/False:
```javascript
{ type: "mcq", question: "PERNYATAAN ANDA.", choices: ["Betul", "Salah"], correct: 0 },
```

---

## ⚠️ Common Errors

### ERROR 1: Lupa Comma
```javascript
❌ SALAH:
{ type: "mcq", question: "A?", choices: ["1"], correct: 0 }
{ type: "mcq", question: "B?", choices: ["1"], correct: 0 }

✅ BETUL:
{ type: "mcq", question: "A?", choices: ["1"], correct: 0 },  ← Ada comma
{ type: "mcq", question: "B?", choices: ["1"], correct: 0 }   ← Soalan terakhir tak perlu
```

### ERROR 2: Index Salah
```javascript
❌ SALAH:
choices: ["A", "B", "C", "D"],  // 4 pilihan (index 0-3)
correct: 4  ← Index 4 tak wujud!

✅ BETUL:
choices: ["A", "B", "C", "D"],  // 4 pilihan
correct: 3  ← Index 3 = Pilihan D
```

### ERROR 3: Lupa hasItems
```javascript
❌ SALAH:
{ type: "mcq", question: "...", items: ["I", "II"], choices: ["I dan II"], correct: 0 }

✅ BETUL:
{ type: "mcq", question: "...", items: ["I", "II"], choices: ["I dan II"], correct: 0, hasItems: true }
```

---

## 🧪 Test Selepas Edit

1. **Save** file
2. **Refresh** browser (F5)
3. **Start quiz** dan check:
   - Soalan baru ada?
   - Jawapan betul?
   - Tiada error?

---

## 💡 Tips

✅ **DO:**
- Copy existing question as template
- Double-check comma placement
- Test after every change
- Verify correct answer index

❌ **DON'T:**
- Delete soalan tanpa backup
- Forget comma between questions
- Use index 1-based (always use 0-based!)
- Edit while quiz is running in browser

---

## 📞 Troubleshooting

**Quiz tidak load?**
→ Check syntax error (comma, bracket, quote)

**Soalan baru tak keluar?**
→ Check comma di soalan sebelumnya
→ Refresh browser (Ctrl+F5)

**Jawapan salah?**
→ Check `correct: X` index (0=first, 1=second, 2=third, 3=fourth)

---

## 📝 Contoh Lengkap: Tambah 3 Soalan

```javascript
let QUESTIONS = [
    // ... soalan sedia ada (line 311-365) ...
    { type: "mcq", question: "Apakah peranan Malaysia dalam Pertubuhan Kerjasama Islam (OIC)?", choices: ["Membantu rakyat Palestin yang tertindas", "Menentang negara Islam lain", "Menghapuskan ajaran agama", "Mengurus pilihan raya antarabangsa"], correct: 0 },

    // SOALAN BARU 1: MCQ Biasa
    { type: "mcq", question: "Apakah maksud singkatan 'SPM'?", choices: ["Sijil Penilaian Malaysia", "Sijil Pelajaran Malaysia", "Sistem Pendidikan Malaysia", "Sekolah Pendidikan Malaysia"], correct: 1 },

    // SOALAN BARU 2: MCQ dengan Items
    { type: "mcq", question: "Antara berikut, yang manakah negeri di Pantai Timur?", items: ["Kelantan", "Selangor", "Terengganu", "Perak"], choices: ["I dan II", "I dan III", "II dan III", "III dan IV"], correct: 1, hasItems: true },

    // SOALAN BARU 3: True/False
    { type: "mcq", question: "Sabah dan Sarawak terletak di Semenanjung Malaysia.", choices: ["Betul", "Salah"], correct: 1 }
];
```

**Total soalan sekarang: 55 + 3 = 58 soalan**

---

## ✅ Checklist Sebelum Save

- [ ] Semua soalan ada comma (kecuali yang terakhir)
- [ ] Format betul (type, question, choices, correct)
- [ ] Soalan dengan items ada `hasItems: true`
- [ ] Index `correct` betul (0, 1, 2, atau 3)
- [ ] Tiada typo dalam text
- [ ] Bracket dan quote matching `[]` `{}` `""`

---

Selamat mengedit! 🎉
