omation;

template marketplace;

mobile native app.

3. Tech Stack

Frontend

Next.js App Router

TypeScript

Tailwind CSS

shadcn/ui atau komponen internal

Lucide Icons

Recharts untuk statistik

React Hook Form

Zod

Backend

Next.js Route Handlers / Server Actions

PostgreSQL

Drizzle ORM

Drizzle Kit

Zod validation

Authentication

Recommended:

Better Auth

Alternatif:

Auth.js

Roles

SUPER_ADMIN
ADMIN
CLIENT

Possible future:

STAFF
RESELLER

External Integration

WordPress

WeddingPress

Custom WordPress REST API

Optional WordPress webhook

4. Existing WeddingPress Data

Berdasarkan database WordPress yang telah diperiksa, WeddingPress menyimpan guestbook/RSVP pada:

wp_wdp_guestbooks

Struktur yang ditemukan:

id          bigint
post_id     bigint
form_id     varchar(100)
name        varchar(100)
message     text
confirm     varchar(20)
avatar      varchar(255)
created_at  datetime

Contoh:

post_id   = 277
form_id   = Nama Undangan
name      = Dimas
message   = Selamat YA tes GPT
confirm   = Hadir
created_at = 2026-09-01 10:56:23

Mapping

WeddingPress

Kykastory

id

externalRsvpId

post_id

wordpressPostId

name

guestName

message

message

confirm

attendanceStatus

avatar

avatarUrl

created_at

submittedAt

post_id harus digunakan sebagai identifier utama untuk menentukan RSVP milik project/undangan yang mana.

5. User Roles & Permissions

SUPER_ADMIN

Pemilik Kykastory.

Dapat:

melihat semua client;

membuat client;

membuat project;

menghubungkan project dengan WordPress;

melihat semua RSVP;

melihat semua guest;

mengubah konfigurasi integrasi;

menghapus project/client;

impersonate client (future);

melihat system health.

ADMIN

Tim operasional Kykastory.

Dapat:

membuat/edit client;

membuat/edit project;

mengelola guest;

melihat RSVP;

konfigurasi invitation;

tidak dapat mengubah konfigurasi sensitif aplikasi.

CLIENT

Pemilik undangan.

Hanya dapat mengakses project yang diberikan kepadanya.

Dapat:

melihat dashboard;

mengelola tamu;

share undangan;

melihat RSVP;

melihat ucapan;

export data;

mengubah template pesan;

mengubah pengaturan tertentu.

Client TIDAK boleh:

melihat client lain;

mengetahui database ID client lain;

mengakses wp-admin;

melihat API credential WordPress.

6. Main Navigation

Sidebar client:

Dashboard
Share Undangan
RSVP & Ucapan
Panduan
Pengaturan

Admin navigation:

Dashboard
Clients
Invitations
RSVP
Guests
Integrations
Settings

7. Core Feature — Authentication

Login

Route:

/login

Input:

email;

password.

Success:

CLIENT → /dashboard
ADMIN → /admin
SUPER_ADMIN → /admin

Requirements

secure password hashing;

httpOnly session cookies;

protected routes;

server-side authorization;

CSRF protection mengikuti authentication library;

rate limit login;

optional forgot password.

8. Core Feature — Project / Invitation

Satu client bisa mempunyai satu atau lebih invitation.

Contoh:

Client
Chika & Fariz

Project
Wedding Chika & Fariz

Project memiliki:

title;

slug;

bride name;

groom name;

event date;

cover image;

public invitation URL;

WordPress post ID;

WordPress base URL;

status;

timezone.

Project Status

DRAFT
ACTIVE
ARCHIVED

9. Dashboard

Route:

/dashboard

Header

Menampilkan:

project title;

pasangan;

profile/project switcher.

Invitation Summary

Menampilkan:

cover image;

couple name;

invitation URL;

event date;

countdown.

Countdown:

Hari
Jam
Menit
Detik

Invitation Stats

Menampilkan:

Total Tamu
Terkirim
Belum Terkirim

RSVP Overview

Menampilkan:

Total RSVP
Total Kehadiran
Total Ucapan
Total Views

Definisi

Total RSVP

Jumlah response WeddingPress.

Hadir

Jumlah RSVP dengan status hadir.

Tidak Hadir

Jumlah RSVP dengan status tidak hadir.

Total Kehadiran

Untuk MVP:

sum guestCount

Jika WeddingPress belum menyediakan jumlah peserta, fallback:

1 RSVP Hadir = 1 kehadiran

Schema harus tetap menyediakan guestCount agar dapat dikembangkan kemudian.

Total Ucapan

Jumlah RSVP dengan message non-empty.

Attendance Chart

Donut chart:

Hadir
Tidak Hadir
Masih Ragu

Status Masih Ragu disediakan di internal schema walaupun belum tentu dikirim WeddingPress.

Recent Wishes

Menampilkan maksimal 5 ucapan terakhir:

name;

attendance;

message;

date.

Button:

Lihat Semua

10. Feature — Share Undangan

Route:

/dashboard/guests

Summary Cards

Total Tamu
Terkirim
Belum Terkirim

Guest Table

Columns:

Nama Tamu
No. HP
Status
Aksi

Actions:

WhatsApp;

copy message;

copy link;

edit;

delete.

Guest Status

NOT_SENT
SENT

Future:

OPENED
RSVP_RECEIVED

Add Guest

Fields:

Nama
Nomor WhatsApp
Kategori optional
Jumlah seat optional
Catatan optional

On create generate:

guestSlug
invitationUrl

Example:

https://domain.com/chika-fariz?to=Aditya-Dewi

atau jika WordPress menggunakan guest parameter tertentu:

https://domain.com/chika-fariz/?to=Aditya%20%26%20Dewi

Format final harus configurable.

Import Guest

Supported MVP:

CSV

Columns:

name
phone

Future:

XLSX
Google Contacts

Duplicate Detection

Detect berdasarkan:

normalized phone;

name + project.

User dapat:

Skip duplicate
Replace
Import anyway

MVP dapat menggunakan Skip duplicate.

11. Template Pesan

Route/dialog:

/dashboard/guests/message-template

Fields:

Template Name
Message

Available variables:

{{guest_name}}
{{couple_name}}
{{invitation_url}}
{{event_date}}

Example:

Kepada Yth.
{{guest_name}}

Dengan bahagia kami mengundang Anda ke acara pernikahan kami.

Silakan buka undangan melalui:
{{invitation_url}}

Terima kasih.
{{couple_name}}

12. WhatsApp Sharing

MVP tidak menggunakan WhatsApp API.

Generate URL:

https://wa.me/{phone}?text={encodedMessage}

Ketika user menekan tombol WhatsApp:

validate phone;

generate personalized message;

open WhatsApp;

record share activity;

mark guest sebagai SENT.

Important:

Status SENT berarti client menekan tombol share, bukan jaminan WhatsApp benar-benar terkirim.

UI harus menjelaskan semantik tersebut jika diperlukan.

13. RSVP & Ucapan

Route:

/dashboard/rsvp

Summary

Cards:

Hadir
Tidak Hadir
Total Kehadiran
Ucapan

Filters

Semua
Hadir
Tidak Hadir
Ada Ucapan

Optional search:

Cari nama / ucapan

Table

Columns:

Nama
Status
Hadir
Ucapan
Waktu

Example:

Dimas
HADIR
1
Selamat ya
01 Sep 2026

Status mapping

WeddingPress values harus dinormalisasi.

Example:

"Hadir"        -> ATTENDING
"hadir"        -> ATTENDING
"Tidak Hadir"  -> NOT_ATTENDING
"tidak"        -> NOT_ATTENDING
"Ragu"         -> MAYBE

Unknown values:

UNKNOWN

Jangan membuang data unknown.

14. Export

MVP:

CSV;

PDF optional phase 1.1.

CSV RSVP fields:

Name
Attendance Status
Guest Count
Message
Submitted At

CSV Guest fields:

Name
Phone
Sent Status
Invitation URL
Created At

15. WeddingPress Integration

Jangan memberikan akses database MySQL WordPress langsung dari browser/client.

Recommended architecture:

WeddingPress Database
       ↓
Custom WordPress Plugin
       ↓
Authenticated REST API
       ↓
Kykastory Backend
       ↓
PostgreSQL

WordPress Plugin

Name suggestion:

Kykastory Bridge

Plugin bertugas:

membaca wp_wdp_guestbooks;

expose REST API;

optional webhook;

authentication API;

normalize response.

Endpoint

GET /wp-json/kykastory/v1/rsvp

Parameters:

post_id
after
page
per_page

Example:

GET /wp-json/kykastory/v1/rsvp?post_id=277

Response:

{
  "data": [
    {
      "externalId": 3,
      "wordpressPostId": 277,
      "name": "Dimas",
      "message": "Selamat YA tes GPT",
      "status": "ATTENDING",
      "avatarUrl": "...",
      "submittedAt": "2026-09-01T10:56:23"
    }
  ]
}

Authentication

Recommended:

Bearer Integration Token

Token stored:

encrypted/server-only in Kykastory;

hashed where appropriate in WordPress.

Never expose token ke frontend.

16. RSVP Sync Strategy

Recommended MVP:

Polling + manual sync

Flow:

Next.js server
   ↓
Kykastory Bridge
   ↓
WeddingPress
   ↓
upsert PostgreSQL

Sync:

saat dashboard dibuka jika data stale;

manual refresh;

cron setiap 1–5 menit optional.

Recommended production:

Webhook push + scheduled reconciliation

Webhook:

WeddingPress RSVP submitted
       ↓
Kykastory Bridge
       ↓
POST Kykastory webhook
       ↓
PostgreSQL

Scheduled reconciliation memastikan tidak ada webhook yang terlewat.

17. Database Design

users

id
name
email
emailVerified
passwordHash
role
createdAt
updatedAt

projects

id
ownerId
name
slug
coupleName
brideName
groomName
eventDate
timezone
coverImageUrl
invitationUrl
status
createdAt
updatedAt

project_members

id
projectId
userId
role
createdAt

wordpress_integrations

id
projectId
baseUrl
wordpressPostId
encryptedToken
lastSyncAt
syncStatus
createdAt
updatedAt

Unique:

projectId
baseUrl + wordpressPostId

guests

id
projectId
name
phone
normalizedPhone
slug
seatCount
category
notes
deliveryStatus
sentAt
createdAt
updatedAt

Unique recommended:

projectId + slug

message_templates

id
projectId
name
content
isDefault
createdAt
updatedAt

share_logs

id
projectId
guestId
channel
action
createdAt

Channel:

WHATSAPP
COPY_LINK
COPY_MESSAGE

rsvps

id
projectId
externalSource
externalRsvpId
guestName
attendanceStatus
guestCount
message
avatarUrl
submittedAt
rawPayload
createdAt
updatedAt

Unique:

projectId
externalSource
externalRsvpId

project_stats

Optional cache table.

projectId
totalGuests
sentGuests
totalRsvp
attendingRsvp
notAttendingRsvp
maybeRsvp
totalAttendance
totalMessages
totalViews
updatedAt

MVP boleh dihitung langsung dengan SQL dan belum menggunakan table cache.

18. Drizzle Schema Enums

role:
SUPER_ADMIN
ADMIN
CLIENT

projectStatus:
DRAFT
ACTIVE
ARCHIVED

deliveryStatus:
NOT_SENT
SENT

attendanceStatus:
ATTENDING
NOT_ATTENDING
MAYBE
UNKNOWN

integrationSource:
WEDDINGPRESS

syncStatus:
IDLE
SYNCING
SUCCESS
ERROR

19. API Design

Internal API examples:

GET    /api/projects/:projectId
GET    /api/projects/:projectId/stats

GET    /api/projects/:projectId/guests
POST   /api/projects/:projectId/guests
PATCH  /api/projects/:projectId/guests/:guestId
DELETE /api/projects/:projectId/guests/:guestId

POST   /api/projects/:projectId/guests/import

POST   /api/projects/:projectId/share/:guestId

GET    /api/projects/:projectId/rsvp
POST   /api/projects/:projectId/rsvp/sync

GET    /api/projects/:projectId/templates
POST   /api/projects/:projectId/templates

GET    /api/projects/:projectId/export/rsvp
GET    /api/projects/:projectId/export/guests

Prefer Server Actions untuk UI mutation sederhana, Route Handler untuk integration/webhook/export.

20. Multi-Tenancy Security

Ini requirement kritis.

Setiap query harus scoped:

user → project membership → resource

Never trust:

projectId dari browser saja

Example server authorization:

session.user.id
       ↓
project_members
       ↓
allowed project
       ↓
query data

Client A tidak boleh dapat mengakses:

/api/projects/PROJECT_CLIENT_B/...

meskipun mengetahui ID-nya.

21. UI Requirements

Target UI mengikuti referensi dashboard Kykastory:

General

desktop-first;

responsive tablet/mobile;

sidebar fixed desktop;

mobile drawer;

clean white/gray UI;

large rounded cards;

subtle borders;

minimal shadow;

typography modern;

black primary buttons;

neutral beige/gold accent;

red only untuk destructive / tidak hadir;

orange untuk pending/belum terkirim.

Page Width

Recommended:

max-width: 1600px

Dashboard content menggunakan responsive grid.

22. Responsive Requirements

Desktop:

sidebar + main content

Tablet:

collapsible sidebar

Mobile:

top navbar
drawer navigation
stacked cards
responsive table → cards / horizontal scroll

Guest actions pada mobile dapat menggunakan:

three dots menu

23. Dashboard Loading States

Setiap page wajib mempunyai:

skeleton;

empty state;

error state;

retry.

Examples:

Belum ada tamu.
Tambahkan tamu pertama Anda.

Belum ada RSVP.
Response tamu akan tampil di sini.

24. Search, Filter & Pagination

Guest:

search name
search phone
filter sent status

RSVP:

search name/message
filter attendance
filter has message

Pagination server-side.

Recommended:

20–50 rows/page

Query string:

?page=1
&search=dimas
&status=ATTENDING

25. Project Settings

Route:

/dashboard/settings

Sections:

Invitation

project name;

couple name;

event date;

invitation URL.

Guest URL

Configure parameter:

?to=

WeddingPress Integration

Read-only client:

Connection: Connected
Last Sync: ...
WordPress Post ID: ...

Admin-only:

Base URL
Post ID
API Token
Test Connection
Sync Now

Message Templates

Default share message.

26. Guide / Panduan

Route:

/dashboard/guide

Content:

Cara menambahkan tamu.

Cara import CSV.

Cara membagikan WhatsApp.

Cara melihat RSVP.

Arti status terkirim.

Cara export data.

27. Views Tracking

Dashboard reference memiliki TOTAL VIEWS.

MVP implementation options:

Recommended

Custom endpoint pada WordPress / Next.js tracking pixel.

Store:

projectId
timestamp
anonymous visitor hash optional

Avoid storing unnecessary personally identifiable data.

Table:

invitation_views

Schema:

id
projectId
visitorHash nullable
viewedAt

Stats:

totalViews
uniqueViews optional future

28. Validation

Guest name:

min 1
max 150

Phone:

optional;

normalize Indonesian numbers;

0812... → 62812....

Message:

max configurable

All integration data must be sanitized before rendering.

29. Error Handling

Integration status:

CONNECTED
SYNCING
ERROR
DISCONNECTED

Errors must be logged server-side.

Client sees friendly message:

Data RSVP belum dapat diperbarui.
Data terakhir masih dapat dilihat.

Do not expose:

SQL;

stack trace;

token;

WordPress credentials.

30. Logging

Track:

LOGIN
GUEST_CREATED
GUEST_UPDATED
GUEST_DELETED
GUEST_SHARED
RSVP_SYNC_STARTED
RSVP_SYNC_SUCCESS
RSVP_SYNC_FAILED
EXPORT
INTEGRATION_CHANGED

Optional table:

audit_logs

31. Security Requirements

HTTPS only production.

Environment secrets server-side only.

SQL through Drizzle parameterization.

Zod validation.

Auth + project authorization on every protected action.

API rate limiting.

Integration token rotation.

Never expose WordPress DB credentials.

Escape/sanitize guest message.

CSP where practical.

Secure cookies.

Backup PostgreSQL.

Backup WordPress.

32. Suggested Folder Structure

src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── guests/
│   │   ├── rsvp/
│   │   ├── guide/
│   │   └── settings/
│   │
│   ├── admin/
│   │   ├── clients/
│   │   ├── projects/
│   │   └── integrations/
│   │
│   └── api/
│       ├── integrations/
│       ├── webhook/
│       └── export/
│
├── components/
│   ├── dashboard/
│   ├── guests/
│   ├── rsvp/
│   ├── layout/
│   └── ui/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   └── index.ts
│
├── lib/
│   ├── auth/
│   ├── permissions/
│   ├── wordpress/
│   ├── rsvp/
│   └── validation/
│
└── types/

33. WordPress Bridge Structure

Separate plugin:

kykastory-bridge/
├── kykastory-bridge.php
├── includes/
│   ├── class-api.php
│   ├── class-rsvp.php
│   ├── class-auth.php
│   └── class-webhook.php
└── uninstall.php

WeddingPress table name jangan hardcode prefix wp_.

Gunakan:

global $wpdb;

$table = $wpdb->prefix . 'wdp_guestbooks';

Query harus menggunakan $wpdb->prepare() apabila menerima parameter dinamis.

34. WordPress Bridge Endpoint Logic

Concept:

GET /wp-json/kykastory/v1/rsvp?post_id=277

Internally:

validate API token
↓
validate post_id
↓
query {$wpdb->prefix}wdp_guestbooks
↓
normalize status
↓
return JSON

Endpoint hanya boleh mengembalikan field yang diperlukan.

35. Sync Algorithm

Pseudo:

get integration by project
↓
request WeddingPress RSVP
↓
validate response
↓
for each response
    UPSERT rsvp
    using:
    projectId + externalSource + externalRsvpId
↓
save lastSyncAt
↓
update integration status

Important:

Sync harus idempotent.

Menjalankan sync 10 kali tidak boleh membuat 10 duplicate RSVP.

36. MVP User Journey

Admin

Admin Login
↓
Create Client
↓
Create Project
↓
Set Invitation URL
↓
Set WordPress Post ID
↓
Connect Kykastory Bridge
↓
Assign Client

Client

Login
↓
Dashboard
↓
Add / Import Guests
↓
Share Invitation
↓
Guest opens WordPress Invitation
↓
Guest submits WeddingPress RSVP
↓
Kykastory syncs RSVP
↓
Client sees dashboard update

37. MVP Scope

Phase 1 — Foundation

Next.js setup

Tailwind

PostgreSQL

Drizzle

Auth

roles

project system

multi-tenant authorization

Phase 2 — Guest Management

guest CRUD

search

status

personalized URL

WhatsApp share

CSV import

Phase 3 — WeddingPress

Kykastory Bridge plugin

API authentication

RSVP retrieval

RSVP sync

normalization

Phase 4 — Dashboard

stats

countdown

recent wishes

attendance chart

Phase 5 — RSVP Page

filters

search

table

export CSV

Phase 6 — Polish

responsive

empty states

error states

audit logging

performance

security review

38. Acceptance Criteria

MVP dianggap selesai jika:

Client dapat login.

Client hanya melihat project miliknya.

Admin dapat membuat client/project.

Project dapat dipetakan ke WordPress post_id.

Guest dapat ditambahkan.

Guest dapat diimport dari CSV.

Personalized invitation link dapat dibuat.

Button WhatsApp membuka pesan yang sudah dipersonalisasi.

Status guest dapat menjadi SENT.

WeddingPress RSVP dari wp_wdp_guestbooks dapat masuk ke Kykastory.

RSVP tidak duplicate ketika sync berulang.

Dashboard menghitung Hadir/Tidak Hadir/Ucapan.

Recent wishes ditampilkan.

RSVP dapat dicari/difilter.

RSVP dapat diexport CSV.

Client A tidak dapat mengakses data Client B.

API credential tidak pernah tampil di frontend.

Dashboard responsive.

39. Future Roadmap

Setelah MVP stabil:

Phase 2

webhook realtime;

official WhatsApp Business API;

scheduled WhatsApp messaging;

email invitation;

custom domain;

QR code guest;

check-in;

seating;

guest groups;

RSVP reminder;

analytics;

unique views;

invitation open tracking.

Phase 3

invitation builder;

template marketplace;

subscription;

payment gateway;

reseller dashboard;

custom branding;

white-label;

multi-language invitation.

40. Recommended Development Decision

Untuk Kykastory, gunakan pembagian tanggung jawab berikut:

WordPress
= invitation rendering
= Elementor
= WeddingPress RSVP input

Next.js
= dashboard
= authentication
= guest management
= admin
= reporting

PostgreSQL
= Kykastory application database

WeddingPress
= source RSVP submission

Kykastory Bridge
= integration boundary

Hindari Next.js mengakses MySQL WordPress secara langsung pada production.

Alasan:

credentials database WordPress tidak perlu tersebar;

lebih aman;

lebih mudah jika WordPress berpindah server;

lebih mudah menangani perubahan WeddingPress;

Next.js tidak tergantung struktur internal database plugin;

integration dapat diberi versioning;

memungkinkan webhook di masa depan.

41. Definition of Done

Suatu feature dianggap selesai apabila:

UI selesai;

responsive;

loading state;

empty state;

validation;

authorization;

error handling;

database migration;

TypeScript tanpa error;

lint pass;

tested pada minimum role ADMIN dan CLIENT;

tidak ada credential dalam client bundle;

acceptance criteria feature terpenuhi.

42. Development Notes

Prioritaskan correctness dan multi-tenancy daripada animasi/polish.

Urutan prioritas:

Security
↓
Data ownership
↓
WeddingPress integration
↓
Guest management
↓
Dashboard statistics
↓
UX polish

Jangan menjadikan WordPress user sebagai core authentication Kykastory kecuali ada alasan khusus. Lebih baik Kykastory mempunyai authentication sendiri dan WordPress diperlakukan sebagai external invitation engine.

Dengan desain ini, di masa depan invitation engine dapat diganti dari WordPress ke Next.js tanpa harus membangun ulang dashboard dan database client.