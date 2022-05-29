import xnat
import sys
import json

# -------------------------------------------------------------------------------------------------

def get_projects_user(connection):

  # all projects for this session
  projects = connection.projects
  return projects

# -------------------------------------------------------------------------------------------------

if __name__ == '__main__':

  # find number of sites to query
  inputArgs = sys.argv[1:len(sys.argv)+1]
  #print(inputArgs)
  #print(len(inputArgs))
  nXnats = int(len(inputArgs)/3)
  #print(nXnats)

  # separate urls from sessions and names
  urls = inputArgs[0:nXnats]
  sessionIds = inputArgs[nXnats:(nXnats*2)]
  xnatNames = inputArgs[(nXnats*2):(len(inputArgs))]
  #print(urls)
  #print(sessionIds)

  # make XNAT connection for each and get projects
  allProjects = []
  for x in range(nXnats):
    thisUrl = str(urls[x])
    thisSession = str(sessionIds[x])
    thisXnat = xnatNames[x]
    #print(thisUrl)
    #print(thisSession)
    connection = xnat.connect(thisUrl, jsession=thisSession)

    # get this session's projects
    projects = get_projects_user(connection)
    #allProjects.append(projects.values)
    for proj in projects.values():
      thisProject = {}
      thisProject["XNAT"] = thisXnat
      thisProject["project"] = proj.id
      allProjects.append(thisProject)

  # return data
  allProjects = json.dumps(allProjects)
  print(allProjects)