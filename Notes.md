

Things to do :

* [ ] change middleware to use proxy
* [ ] link user login to a databse (mongoDB)
* [ ] make it when you log in the want and collection button reflect what is in the database
* [ ] create a documetn in monog db for a single user ? with all their info maybe that would be easier?
* [ ] have ai create a documentation of the file Auth0 and Auth0 in Security
* [ ] create a profile page just displaying all the data in that the user has...
* [ ] the event images should go to an event page, giving details about the upcoming event
* [ ] look into IGN api
* [ ] look into Steam API









Retro game collection site

- [ ] similar to Discogs for vinyl records, and music media
- [ ] Have a tab for nearby stores with sponsored spots at the top
- [ ] Have a way to also scan the barcode of a game to search for or to create the game in the database
- [ ] Have a way to create the game without scanning a barcode due to older games and games without the full case
- [ ] Have different list for the user 1. my wants to 2. My collection
- [ ] Have a way to move my wants to my collection list
- [ ] Have different media types as in digital copy, complete inbox, media only, and incomplete with media
  - [ ] Have a way to allow people to sell their games on the site
- [ ] Also show things for the game like average price and highest price in lowest price
- [ ] Have a grading scale for the game condition
- [ ] Price data comes from pricecharting.com
- [ ] Thegamesdb.net
- [ ] Storage location information
- [ ] Ability to add consoles and peripherals
- [ ] Have a marketplace where users can sale their games
- [ ] Have a paid retail version for game stores to sync stock and be able to show it online with live updates when a game has been sold in store it reflects online. This one can be where the even a api that can be integrated to the stores already existing site

the videos "video_id" is the last part of this url :
https://www.youtube.com/watch?v=qeu4fFyRXLA

so the pice that needs to change is after "v="

https://www.youtube.com/watch?v=video_id


things to update later when i publish:

On Auth0

* **Allowed Callback URLs** are a critical security measure to ensure users are safely returned to your application after authentication. Without a matching URL, the login process will fail, and users will be blocked by an Auth0 error page instead of accessing your app.
* **Allowed Logout URLs** are essential for providing a seamless user experience upon signing out. Without a matching URL, users will not be redirected back to your application after logout and will instead be left on a generic Auth0 page.
* **Allowed Web Origins** is critical for silent authentication. Without it, users will be logged out when they refresh the page or return to your app later.

  TestDev123!!
