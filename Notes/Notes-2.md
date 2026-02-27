How things are working

Backend:

1. Loads the env files names .env and .env.local

   * .env contians evironment variables that can get pushed to the github
   * .env.local contains secrets that should not be pushed to the gtihub
   * There is also a .env.example that shows what env variables are needed
2. create a applicastion object using `app = FastAPI()`

   * this object id the central registry and controller of your entire project which:

     * Holds all your routes
     * Stores middleware
     * Stores dependencies
     * Stores configuration
     * Manages startup/shutdown events
     * Exposes itself as an ASGI app to Uvicorn
   * your actually creating a starlette application instance
   * its needed because the server(uvicorn) needs a ASGI callable object

     * when you run `uvicorn main:app` its looking at the `main.py` and looking for the `app` variable instance
   * 🎯 Think of It Like This

     * If you're building a house:
       * `FastAPI()` = the land and foundation
       * `@app.get()` = building rooms on it
       * Middleware = security system
       * Dependencies = plumbing
       * Routers = modular wings
3. NOTE: You need to understand the difference between `include_router()` and `mount()`

   * `include_router()` is mor for organiztional use make it more clean and understandable
   * `mount() `is for adding a totally seperate fastAPI app that contains its own :

     * middleware stack
     * dependecies
     * OpenAPI doc (if configured)
     * lifespan events
     * exception handlers
     * `mount()` is fully isolated
   * Rule of thumb:

     * Want **clean structure** inside one API? → `include_router()`
     * Want **separate app boundaries** but still one deployment? → `mount()`
     * Want  **independent deploy/scale/failure isolation** ? → microservices
4. create a settings file to contain the env variables and other information used in the backend application

* BaseSettings

  * special pydantic class designed for :
    * Reading values from env variables and validating them
    * not a normal class
    * inheriting from BaseSettings giver you
      * Automatic reading from env variables
      * type conversion
      * validation
      * default handling
      * required field enforcment
  * attributes

  ```python
  APP_NAME: str = "GameOverVault"
  DEBUG: bool = False
  DATABASE_URL: str
  SECRET_KEY: str

  #These are:
  #- Typed fields
  #- Configuration variables
  #- Environment variable bindings

  ```

  ```python
  APP_NAME: str = "GameOverVault"

  # This means:
  #- Type: string
  #- Default value: "GameOverVault"
  #- If environment variable APP_NAME exists → override default
  #- If not → use default

  # So if your .env contains:
  # APP_NAME=SuperApp
  # It overrides the default.
  ```

  ```python
  DEBUG: bool = False

  # Type: boolean
  # Default: False

  # If .env has:
  # DEBUG=true
  # Pydantic automatically converts "true" → True (bool)
  # That automatic casting is powerful.
  ```

  ```python
  DATABASE_URL: str

  # Notice there is NO default.
  # That means:
  # This is required.

  # If the environment variable does not exist,
  # your app crashes at startup.
  # That’s intentional in production.

  # Fail fast > silent misconfiguration.
  ```

5. tags on the include routers help the auto docs with organizing
6. Make sure i am using the most accurate endpoint (POST, GET, PUT, PATCH, etc)
7. In Backend/auth.py, wrap jwt.get_unverified_header(token) in try/except too, so malformed tokens return clean 401 instead of raw jose stack errors.
8. Also useful for debugging exact 422 payload:
   * That will show which fields FastAPI says are missing/invalid.
   * ```python
     try{
     ...
     } catch (err: any) {
          console.error(err.response?.data);
     }


     ```
9. create a page to view more upcoming and more all time favorites
10. Add backend caching for /platforms (even 5–15 min TTL) to avoid repeated IGDB hits.
