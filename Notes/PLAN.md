# GameOverVault - Project Plan & Roadmap

**Last Updated:** 2026-02-04
**Project Status:** Early-stage MVP with working authentication

---

## 🎯 Project Vision

Build a comprehensive retro game collection platform similar to Discogs for vinyl records - allowing users to:

- Track their game collection and wish lists
- Buy/sell games in a marketplace
- Discover local game stores
- Price games using real market data
- Manage storage locations and game conditions

---

## 🔴 HIGH PRIORITY FIXES & IMPROVEMENTS

### 1. [--FIXED--] Fix NextJS Middleware Deprecation Warning

**Priority:** CRITICAL
**Status:** ⚠️ Not Started
**Issue:** Current middleware uses deprecated patterns
**Action:** Update to use "proxy" pattern as recommended by Next.js

**Files to Update:**

- `frontend/src/middleware.ts`
- Review Auth0 Next.js v4 proxy middleware documentation

---

### 2. [--FIXED--] Load User's Game Collection State on Page Load

**Priority:** HIGH
**Status:** ⚠️ Not Started
**Current Issue:** When user views a game, the want/collected buttons don't reflect their previous selections

**Backend Tasks:**

- Create `GET /games/user` endpoint to fetch all user's saved games
- Create `GET /games/check/{igdb_id}` endpoint to check if specific game is saved

**Frontend Tasks:**

- In `game-info/page.tsx`, fetch user's game state on component mount
- Update initial button states based on database
- Show loading skeleton while fetching

**Files to Create/Update:**

- `Backend/main.py` - Add new endpoints
- `frontend/src/lib/api/db.ts` - Add fetch functions
- `frontend/src/app/game-info/page.tsx` - Load initial state

---

### 3. [--FIXED--] Update/Upsert Instead of Always Inserting

**Priority:** HIGH
**Status:** ⚠️ Not Started
**Current Issue:** Clicking want/collected multiple times creates duplicate database entries

**Backend Tasks:**

- Change `/games/save` to use `update_one()` with `upsert=True`
- Use `user_id + igdb_id` as unique identifier
- Handle toggle logic (if already exists with same flag, remove it)

**Files to Update:**

- `Backend/main.py` - Update `/games/save` endpoint logic
- Consider adding MongoDB index on `{user_id: 1, igdb_id: 1}` for performance

---

### 4. Type Safety Improvements

**Priority:** MEDIUM
**Status:** ⚠️ Not Started
**Issues:**

- SearchBar uses `any[]` for searchResults
- Missing proper TypeScript interfaces in several places

**Tasks:**

- Create proper type definitions for search results
- Add types for API responses
- Enable stricter TypeScript settings

**Files to Update:**

- `frontend/src/components/SearchBar.tsx`
- `frontend/src/lib/types.ts` - Add new interfaces

---

## 🎮 CORE FEATURE DEVELOPMENT

### 5. User Collection Page

**Priority:** HIGH
**Status:** ⚠️ Not Started
**Description:** Display all games in user's collection

**Features:**

- Grid/list view toggle
- Sort by: date added, name, release date, rating
- Filter by: platform, genre, completion status
- Search within collection
- Statistics (total games, total value, platforms breakdown)

**New Files to Create:**

- `frontend/src/app/collection/page.tsx`
- `frontend/src/components/CollectionGrid.tsx`
- `frontend/src/components/CollectionFilters.tsx`

**Backend:**

- `GET /games/collection` - Fetch user's collected games with pagination
- Add query parameters for sorting and filtering

---

### 6. User Want List Page

**Priority:** HIGH
**Status:** ⚠️ Not Started
**Description:** Display all games in user's wish list

**Features:**

- Similar to collection page layout
- "Move to Collection" button for each game
- Priority ranking system
- Price tracking and alerts

**New Files to Create:**

- `frontend/src/app/want-list/page.tsx`
- Reuse collection components with different data

**Backend:**

- `GET /games/wants` - Fetch user's wanted games

---

### 7. Enhanced Profile Page

**Priority:** MEDIUM
**Status:** ⚠️ Partially Complete (shows user info only)
**Description:** Comprehensive user profile with statistics and data

**Features to Add:**

- Collection statistics (total games, total value, growth chart)
- Platform breakdown (pie chart)
- Recent activity feed
- Top genres
- Completion percentage
- Account settings

**Files to Update:**

- `frontend/src/app/profile/page.tsx` - Expand with new sections
- Create dashboard components

**Backend:**

- `GET /users/stats` - Aggregate statistics
- `GET /users/activity` - Recent actions

---

### 8. Event Details Page

**Priority:** MEDIUM
**Status:** ⚠️ Not Started
**Description:** Clicking event images should navigate to detailed event page

**Features:**

- Event information (date, time, location, description)
- Related games showcase
- Video trailers
- External links to event websites
- "Add to Calendar" functionality

**New Files to Create:**

- `frontend/src/app/events/[eventId]/page.tsx`
- `frontend/src/components/EventDetails.tsx`

**Files to Update:**

- `frontend/src/app/page.tsx` - Make event cards clickable

---

### 9. Game Removal Functionality

**Priority:** MEDIUM
**Status:** ⚠️ Not Started
**Description:** Allow users to remove games from collection/want list

**Backend:**

- `DELETE /games/{game_id}` - Remove game from user's collection
- Or update `/games/save` to accept `null` values to indicate removal

**Frontend:**

- Add confirmation dialog before removal
- Optimistic UI update
- Toast notification on success

---

## 💾 DATABASE & BACKEND ENHANCEMENTS

### 10. Database Schema Improvements

**Priority:** HIGH
**Status:** ⚠️ Not Started

**Tasks:**

1. **Add Indexes:**

   ```python
   # In mongodb.py or migration script
   collection.create_index([("user_id", 1), ("igdb_id", 1)], unique=True)
   collection.create_index([("user_id", 1), ("added_at", -1)])
   collection.create_index([("user_id", 1), ("collected", 1)])
   collection.create_index([("user_id", 1), ("want", 1)])
   ```
2. **Expand Game Document Schema:**

   ```python
   {
       "user_id": str,
       "igdb_id": int,
       "name": str,
       "cover_url": str,
       "collected": bool,
       "want": bool,
       "added_at": datetime,
       # NEW FIELDS:
       "platform": str,              # Primary platform
       "platforms": [str],           # All platforms owned
       "media_type": str,            # digital, complete, media_only, incomplete
       "condition": str,             # mint, excellent, good, fair, poor
       "storage_location": str,      # Where physically stored
       "notes": str,                 # User notes
       "purchase_price": float,      # What they paid
       "purchase_date": datetime,
       "current_value": float,       # From PriceCharting API
       "last_value_update": datetime,
       "barcode": str,               # UPC/EAN
       "custom_tags": [str],         # User-defined tags
       "completed": bool,            # Have they beaten it
       "completion_date": datetime,
       "play_time_hours": float,
       "rating": int,                # User's personal rating 1-10
   }
   ```
3. **Create User Preferences Collection:**

   ```python
   users_collection = {
       "user_id": str,
       "created_at": datetime,
       "preferences": {
           "default_view": str,      # grid/list
           "default_sort": str,
           "theme": str,
           "notifications": bool,
       },
       "stats_cache": {              # Cached aggregations
           "total_games": int,
           "total_value": float,
           "last_updated": datetime,
       }
   }
   ```

---

### 11. Pagination & Performance

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Tasks:**

- Implement pagination for all list endpoints
- Add page size limits (default 20, max 100)
- Implement cursor-based pagination for better performance
- Cache IGDB responses temporarily

**Example:**

```python
@app.get("/games/collection")
async def get_collection(
    user_id: str = Depends(get_current_user),
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "added_at",
    sort_order: str = "desc"
):
    # Implementation
```

---

### 12. Error Handling & Validation

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Backend Tasks:**

- Add Pydantic models for all request/response schemas
- Consistent error response format
- Request validation
- Rate limiting for API endpoints

**Frontend Tasks:**

- Add error boundaries
- Toast notifications for errors
- Retry logic for failed requests
- Offline state handling

---

## 🎨 FRONTEND UI/UX IMPROVEMENTS

### 13. Loading States & Skeletons

**Priority:** MEDIUM
**Status:** ⚠️ Partially Complete

**Tasks:**

- Add loading skeletons for all async operations
- Loading spinners for buttons during save operations
- Skeleton cards for game grids
- Progressive image loading

**Files to Update:**

- All pages with async data fetching
- Reuse existing `PageSkeleton.tsx` component

---

### 14. Error States & Empty States

**Priority:** MEDIUM
**Status:** ⚠️ Partially Complete

**Tasks:**

- Empty state components with helpful CTAs
- Error state components with retry buttons
- 404 pages
- Network error handling

**New Components to Create:**

- `EmptyState.tsx` - Generic empty state
- `ErrorBoundary.tsx` - React error boundary

---

### 15. Toast Notifications

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- Add toast library (sonner or react-hot-toast)
- Success notifications for save operations
- Error notifications
- Undo functionality for deletions

---

### 16. Image Optimization & Modals

**Priority:** LOW
**Status:** ✅ Mostly Complete

**Current State:**

- Images use Next.js Image component
- Full-size modal works on game-info page

**Enhancements:**

- Add image zoom functionality
- Gallery lightbox navigation
- Lazy loading improvements

---

## 🚀 ADVANCED FEATURES (Roadmap)

### 17. Barcode Scanning

**Priority:** MEDIUM
**Status:** ⚠️ Not Started
**Description:** Allow users to scan game barcodes to add to collection

**Technical Approach:**

- Use device camera with library like `react-zxing` or `html5-qrcode`
- Send barcode (UPC/EAN) to backend
- Backend queries PriceCharting API for game details
- Fallback to IGDB search if not found
- Manual entry option for games without barcodes

**New Files:**

- `frontend/src/components/BarcodeScanner.tsx`
- `frontend/src/app/scan/page.tsx`

**Backend:**

- `POST /games/scan` - Accept barcode and return game details

---

### 18. Media Type & Condition Tracking

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Media Types:**

- Digital Copy
- Complete in Box (CIB)
- Media Only (disc/cartridge only)
- Incomplete (missing manual/inserts)
- New/Sealed

**Condition Grades:**

- Mint/Near Mint
- Excellent
- Good
- Fair
- Poor

**Implementation:**

- Add fields to game document schema
- Add dropdown selectors in UI
- Show condition badges on collection cards

---

### 19. Price Tracking & Alerts

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Features:**

- Fetch current prices from PriceCharting API
- Store price history
- Calculate collection total value
- Price change notifications
- "Good deal" alerts when game drops below threshold

**Backend:**

- Scheduled job to update prices daily
- `GET /games/prices/{igdb_id}` - Price history
- `POST /users/price-alerts` - Set price alerts

**Database:**

- New `price_history` collection
- Store daily snapshots

---

### 20. Storage Location Management

**Priority:** LOW
**Status:** ⚠️ Not Started

**Features:**

- Define storage locations (shelf 1, box A, etc.)
- Assign games to locations
- Filter by location
- Visual storage map

---

### 21. Console & Peripheral Support

**Priority:** LOW
**Status:** ⚠️ Not Started

**Features:**

- Add consoles to collection (separate from games)
- Track peripherals (controllers, cables, accessories)
- Link games to owned consoles
- Console value tracking

---

### 22. User Marketplace

**Priority:** LOW
**Status:** ⚠️ Not Started

**Features:**

- List games for sale
- Set asking price
- Mark as "For Trade" or "For Sale"
- Search marketplace listings
- User ratings and reviews
- Payment integration (Stripe)
- Shipping calculator

**Major Implementation:**

- New `listings` collection in MongoDB
- Seller dashboard
- Buyer search interface
- Transaction management
- Escrow system considerations

---

### 23. Local Store Discovery

**Priority:** LOW
**Status:** ⚠️ Not Started

**Features:**

- Map view of nearby game stores
- Store profiles with inventory
- Sponsored placement for stores
- User reviews and ratings
- Business hours and contact info

**Implementation:**

- Geolocation API
- Google Maps integration
- Store registration system

---

### 24. B2B Retail Sync Platform

**Priority:** LOW
**Status:** ⚠️ Not Started

**Features:**

- Separate paid tier for retail stores
- API for inventory sync
- Real-time stock updates
- Integration with POS systems
- Public storefront widget
- Analytics dashboard for stores

**This is a major feature requiring:**

- Separate authentication tier
- Webhook system
- API rate limiting
- Billing system
- Admin dashboard

---

## 🛠️ TECHNICAL DEBT & REFACTORING

### 25. Type Safety Audit

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- Remove all `any` types
- Add strict TypeScript config
- Create comprehensive type library
- Add JSDoc comments

---

### 26. Component Organization

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- Extract reusable components from pages
- Create feature-based folder structure
- Separate business logic from UI components
- Create custom hooks for common patterns

**Suggested Structure:**

```
frontend/src/
├── app/                  # Pages
├── components/
│   ├── ui/              # Shadcn components
│   ├── layout/          # Header, Footer, Nav
│   ├── games/           # Game-related components
│   ├── collection/      # Collection components
│   ├── marketplace/     # Marketplace components
│   └── common/          # Shared components
├── hooks/               # Custom React hooks
├── lib/
│   ├── api/            # API client functions
│   ├── types/          # TypeScript types
│   └── utils/          # Utilities
└── contexts/           # React contexts
```

---

### 27. Testing

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- Set up Jest + React Testing Library
- Write unit tests for utils
- Write component tests
- Set up E2E testing with Playwright
- Add backend unit tests with pytest

---

### 28. API Response Caching

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- Implement Redis for caching IGDB responses
- Cache user collection data
- Set appropriate TTLs
- Cache invalidation strategy

---

### 29. Documentation

**Priority:** LOW
**Status:** ⚠️ Not Started

**Tasks:**

- API documentation (OpenAPI/Swagger)
- Component storybook
- Developer onboarding guide
- Architecture decision records (ADRs)
- User guide/help center

---

## 🌐 PRODUCTION READINESS

### 30. Environment Configuration

**Priority:** CRITICAL (before deploy)
**Status:** ⚠️ Not Started

**Tasks:**

1. Update Auth0 configuration:

   - Add production URLs to Allowed Callback URLs
   - Add production URLs to Allowed Logout URLs
   - Add production URLs to Allowed Web Origins
2. Environment-specific configs:

   - Development `.env.local`
   - Production `.env.production`
   - Staging `.env.staging`
3. Secure secrets management:

   - Use Vercel environment variables
   - Rotate Auth0 secrets
   - Generate production-grade AUTH0_SECRET

---

### 31. Performance Optimization

**Priority:** HIGH (before launch)
**Status:** ⚠️ Not Started

**Tasks:**

- Enable Next.js production optimizations
- Image optimization (already using Next/Image)
- Bundle size analysis
- Code splitting
- Lazy load routes
- Server-side caching headers
- CDN setup for static assets

---

### 32. SEO & Meta Tags

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Tasks:**

- Add proper meta tags to all pages
- Open Graph tags for social sharing
- Dynamic meta tags based on page content
- Sitemap generation
- robots.txt
- Google Analytics integration

---

### 33. Security Audit

**Priority:** CRITICAL (before launch)
**Status:** ⚠️ Not Started

**Tasks:**

- CSRF protection
- XSS prevention audit
- SQL injection prevention (using MongoDB, but still review)
- Rate limiting on API endpoints
- Input sanitization
- Secure headers (CSP, HSTS, etc.)
- Dependency vulnerability scan
- GDPR compliance considerations

---

### 34. Monitoring & Logging

**Priority:** HIGH (before launch)
**Status:** ⚠️ Not Started

**Tasks:**

- Error tracking (Sentry)
- Application monitoring (Datadog, New Relic)
- Log aggregation
- Uptime monitoring
- Performance monitoring
- User analytics

---

### 35. CI/CD Pipeline

**Priority:** MEDIUM
**Status:** ⚠️ Not Started

**Tasks:**

- GitHub Actions or similar
- Automated testing
- Automated deployments
- Preview deployments for PRs
- Staging environment
- Database migration strategy

---

## 📊 PRIORITIZED IMPLEMENTATION ORDER

### Phase 1: MVP Completion (2-3 weeks)

1. ✅ ~~Authentication Setup~~ (COMPLETE)
2. Fix middleware deprecation warning
3. Load user's previous game states
4. Implement upsert logic for game saves
5. Create Collection page
6. Create Want List page
7. Enhance Profile page with stats

### Phase 2: Core Features (2-3 weeks)

8. Game removal functionality
9. Database schema expansion (media type, condition, etc.)
10. Event details page
11. Pagination and performance improvements
12. Type safety improvements
13. Error handling and validation

### Phase 3: Enhanced UX (1-2 weeks)

14. Loading states and skeletons
15. Toast notifications
16. Error and empty states
17. UI polish and responsiveness

### Phase 4: Advanced Features (3-4 weeks)

18. Barcode scanning
19. Media type and condition tracking
20. Price tracking integration
21. Storage location management

### Phase 5: Marketplace & Social (4-6 weeks)

22. User marketplace
23. Local store discovery
24. User ratings and reviews

### Phase 6: B2B & Monetization (6-8 weeks)

25. B2B retail sync platform
26. Payment integration
27. Subscription tiers

### Phase 7: Production Launch (2-3 weeks)

28. Security audit
29. Performance optimization
30. Environment configuration
31. Monitoring and logging
32. SEO implementation
33. CI/CD setup

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

1. **Fix Middleware Deprecation** - Update to proxy pattern
2. **Implement Upsert Logic** - Prevent duplicate game entries
3. **Add Game State Loading** - Show previous selections on page load
4. **Create Collection Page** - Basic grid view with user's collected games
5. **Type Safety** - Fix searchResults type and add missing interfaces

---

## 📝 NOTES & CONSIDERATIONS

### Auth0 Production Checklist:

- Update Allowed Callback URLs
- Update Allowed Logout URLs
- Update Allowed Web Origins
- Rotate secrets before launch

### API Keys & Limits:

- Monitor IGDB API rate limits
- Monitor PriceCharting API rate limits
- Consider implementing request caching to reduce API calls

### Database Considerations:

- MongoDB Atlas free tier limits
- Plan for scaling and paid tier
- Regular backups
- Data retention policy

### Future Integrations:

- eBay API for marketplace listings
- Amazon Product Advertising API
- Google Maps API for store locations
- Payment processing (Stripe)
- Email service (SendGrid, Mailgun)

---

**End of Plan** - This is a living document and will be updated as the project evolves.
