from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import coc
from pydantic import BaseModel

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176", "http://localhost:5174", "http://localhost:5173", "http://localhost:3000","https://ethanmccleary2256-create.github.io/COC-Dashboard-Pub/"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Global variables (populated on startup / login)
ourStars = 0
opponentStars = 0
ourAttacksUsed = 0
opponentAttacksUsed = 0
ourDestruction = 0
opponentDestruction = 0
TotalStars = 0
RemainingStars = 0
ourName = ""
opponentName = ""
ourState = ""
TotalAttacks = 0
CWL = 0

# Credentials / control
stored_email = None
stored_password = None
stored_clan_tag = None
background_task = None
logged_in = False

class LoginRequest(BaseModel):
    email: str
    password: str
    clan_tag: str

async def fetch_war_data():
    global ourStars, opponentStars, ourAttacksUsed, opponentAttacksUsed, ourDestruction, opponentDestruction, TotalStars, RemainingStars, ourName, opponentName, ourState, TotalAttacks, CWL
    # don't run if not logged in
    if not (stored_email and stored_password and stored_clan_tag):
        ourName = ""
        opponentName = "Not logged in"
        ourState = "Not logged in"
        return

    async with coc.Client() as coc_client:
        try:
            await coc_client.login(stored_email, stored_password)
        except coc.InvalidCredentials as error:
            print(f"Login failed during refresh: {error}")
            return
        clan = await coc_client.get_clan(stored_clan_tag)
        war = await coc_client.get_current_war(stored_clan_tag)
        if war is None:
            ourStars = 0
            opponentStars = 0
            ourAttacksUsed = 0
            opponentAttacksUsed = 0
            ourDestruction = 0
            opponentDestruction = 0
            TotalStars = 0
            RemainingStars = 0
            ourName = clan.name
            opponentName = "No Current War"
            ourState = "Not in war"
            TotalAttacks = 0
            CWL = 0
        else:
            ourStars = war.clan.stars
            opponentStars = war.opponent.stars
            ourAttacksUsed = war.clan.attacks_used
            opponentAttacksUsed = war.opponent.attacks_used
            ourDestruction = round(war.clan.destruction,2)
            opponentDestruction = round(war.opponent.destruction,2)
            TotalStars = war.team_size * 6
            RemainingStars = TotalStars - (ourStars + opponentStars)
            ourName = war.clan.name
            opponentName = war.opponent.name
            ourState = war.state
            TotalAttacks = 0
            CWL = 0
            if war.war_tag == None:
                TotalAttacks = war.team_size * 4
            else:
                TotalAttacks = war.team_size * 2
                CWL = 1

async def background_refresh():
    """Refresh war data every 60 seconds"""
    while True:
        await asyncio.sleep(60)
        await fetch_war_data()

@app.route("/login", methods=["POST", "OPTIONS"])
async def login(payload: LoginRequest):
    """
    Attempt to log in with provided credentials and clan_tag.
    On success store them and start the background refresh.
    """
    global stored_email, stored_password, stored_clan_tag, background_task, logged_in
    try:
        async with coc.Client() as client:
            await client.login(payload.email, payload.password)
            clan = await client.get_clan(payload.clan_tag)
    except Exception as e:
        return {"success": False, "error": str(e)}
    # store credentials (in-memory). For production use secure storage & tokens.
    stored_email = payload.email
    stored_password = payload.password
    stored_clan_tag = payload.clan_tag
    logged_in = True
    # initial fetch now that credentials are set
    await fetch_war_data()
    # start background task if not already running
    if background_task is None or background_task.done():
        background_task = asyncio.create_task(background_refresh())
    return {"success": True, "clan_name": clan.name}

@app.get("/war_stats")
def get_war_stats():
    return {
        "ourStars": ourStars,
        "opponentStars": opponentStars,
        "ourAttacksUsed": ourAttacksUsed,
        "opponentAttacksUsed": opponentAttacksUsed,
        "ourDestruction": ourDestruction,
        "opponentDestruction": opponentDestruction,
        "totalStars": TotalStars,
        "remainingStars": RemainingStars,
        "ourName": ourName,
        "opponentName": opponentName,
        "ourState": ourState,
        "totalAttacks": TotalAttacks,
        "CWL": CWL,
        "logged_in": logged_in
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
