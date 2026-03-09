import datetime

from utils.schemas.igdb import IGDBGameSearchPayload


def getTimestamp():
    return datetime.datetime.now(datetime.timezone.utc)


def igdb_query_builder(criteria:IGDBGameSearchPayload, fields:str = ""):
    genres = ",".join(f'{id}' for id in criteria.genres)
    themes = ",".join(f'{id}' for id in criteria.themes)
    consoles = ",".join(f'{id}' for id in criteria.consoles)
    gameModes = ",".join(f'{id}' for id in criteria.gameModes)

    filters = []
    
    if genres: filters.append(f"genres = ({genres})")
    if themes: filters.append(f"themes = ({themes})")
    if consoles: filters.append(f"platforms = ({consoles})")
    if gameModes: filters.append(f"game_modes = ({gameModes})")
    if criteria.fromDate: filters.append(f"first_release_date >= {criteria.fromDate}")
    if criteria.toDate: filters.append(f"first_release_date <= {criteria.toDate}") 
    if criteria.query: filters.append(f'name ~ *"{criteria.query}"*')
    
    offset = (criteria.page-1) * criteria.limit
    
    where_line = f"where {" & ".join(filters)};" if filters else ""
    sort_line = f"sort {criteria.sort};" if criteria.sort else "sort hypes desc;"
    offset_line = f"offset {offset};" if offset != 0 else ""
    fields_line = f"fields {fields};" if fields else ""
    limit_line = f"limit {criteria.limit};" if criteria.limit else ""
        
    data = f"""
        {fields_line}
        {where_line}
        {sort_line}
        {offset_line}
        {limit_line}
    """
    
    # print(data)
    
    return data