# CampusXchange

CampusXchange – Student Buy, Sell & Exchange Platform

Overview

Build a complete, modern, production-ready web application called CampusXchange.

The application is designed exclusively for college students to buy, sell, and exchange academic and personal items within their campus.

The goal is to create a secure, easy-to-use platform where students can list items such as books, calculators, lab equipment, electronics, bicycles, hostel furniture, and other useful items.

The application should have a clean architecture, modern UI, responsive design, and be scalable for future features.

Target Users

Students (Buyer & Seller)

Administrator

Core Features

Authentication

User Registration

Login

Logout

Forgot Password

Email Verification (placeholder if backend is not implemented)

Secure authentication flow

User Profile

Each user should have:

Profile Picture

Full Name

Department

Year

College

Email

Phone Number

Bio

Join Date

Users should be able to edit their profile.

Dashboard

After login, users should see:

Welcome message

Total Listings

Wishlist Count

Messages

Recently Viewed Items

Recently Added Products

Product Management

Users can:

Add Product

Edit Product

Delete Product

Mark Product as Sold

Upload Multiple Images

Select Category

Set Price

Add Description

Mention Product Condition

Product Conditions:

New

Like New

Good

Fair

Used

Categories:

Books

Electronics

Laptops

Mobile Phones

Calculators

Lab Equipment

Furniture

Hostel Essentials

Bicycles

Accessories

Other

Product Listing Page

Display products as modern responsive cards.

Each card should contain:

Product Image

Product Name

Price

Seller Name

College

Category

Condition

Posted Time

Wishlist Button

View Details Button

Product Details

Display:

Large Image Gallery

Description

Seller Information

Price

Category

Product Condition

Posted Date

Contact Seller Button

Add to Wishlist

Share Product

Search

Global search bar.

Search by:

Product Name

Category

Seller

Keywords

Filters

Allow filtering by:

Category

Price Range

Product Condition

Recently Added

Wishlist

Users can:

Save Items

Remove Items

View Wishlist

Messaging

Simple chat between buyers and sellers.

Features:

Conversation List

Send Messages

Receive Messages

Time Stamp

Notifications

Users receive notifications when:

Someone messages them

Someone wishes their product

Product marked sold

New products in favourite category

Admin Panel

Administrator should be able to:

View Users

Delete Users

View Products

Delete Products

Moderate Listings

View Reports

Dashboard Analytics

Pages Required

Landing Page

Login

Register

Forgot Password

Dashboard

Products

Product Details

Add Product

Edit Product

Wishlist

Messages

Notifications

My Listings

User Profile

Settings

Admin Dashboard

About

Contact

Privacy Policy

404 Page

UI Requirements

Design should be premium and modern.

Use:

Soft gradients

Rounded cards

Smooth animations

Glassmorphism

Hover effects

Beautiful typography

Professional icons

Responsive layouts

Sticky navigation

Dark mode

Light mode

Mobile-first design

The application should look like a real startup product instead of a college project.

Color Palette

Primary:
Blue (#2563EB)

Secondary:
Purple (#7C3AED)

Accent:
Emerald (#10B981)

Background:
Light Gray (#F8FAFC)

Dark Theme:
#0F172A

Use professional spacing and consistent design.

Database Models

User

id

name

email

password

department

year

phone

profileImage

bio

Product

id

sellerId

title

description

price

category

condition

images

status

createdAt

Wishlist

id

userId

productId

Message

id

senderId

receiverId

message

createdAt

Notification

id

userId

title

message

isRead

Additional Features

Responsive Navigation

Skeleton Loading

Empty States

Error Pages

Success Toasts

Confirmation Dialogs

Pagination

Infinite Scroll

Image Preview

Drag & Drop Image Upload

Search Suggestions

Breadcrumb Navigation

Future Ready Features

Design the architecture so it can later support:

Flutter Mobile App

REST API

AI Product Recommendation

AI Search

QR Code Listings

College Verification

Online Payments

Delivery Tracking

Code Quality

Generate clean, modular, production-ready code.

Use reusable components.

Follow modern best practices.

Use meaningful variable names.

Keep the code well organized and scalable.

The application should be fully responsive and ready for deployment.

This project is **CampusXchange**.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
