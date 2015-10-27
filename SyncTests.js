var GitHubApi = require("github");
//uses github api to sync tests.json from main repo to all implementations.
//must set GITHUB_TOKEN. generate a personal access token that has access to the repositories.
var token = process.env.GITHUB_TOKEN;
if (token == null){
	console.log("GITHUB_TOKEN env var required");
	process.exit(1);
}
var github = new GitHubApi({
    version: "3.0.0",
    protocol: "https",
    timeout: 5000,
    headers: {
        "user-agent": "Scyntax test sync"
    }
});

github.authenticate({
   type: "oauth",
    token: token,
});

var expectedSha = "";
var expectedContent = "";
// repositories to check. Add implementations here.
reposToCheck = [
	{owner:"schyntax", repo:"go-schyntax", path:"tests.json"},
	{owner:"schyntax", repo:"cs-schyntax", path:"Schyntax.Tests/tests.json"},
	{owner:"schyntax", repo:"js-schyntax", path:"test/tests.json"},
];

// look up master file.
console.log("Getting tests.json from schyntax/schyntax")
github.repos.getContent({
    user: "schyntax",
	repo: "schyntax",
	path: "tests.json",
}, function(err, res) {
	if (err != null){console.log(err); return;}
    console.log("sha:", res.sha);
	expectedSha = res.sha;
	expectedContent = res.content;
	checkRepo(0)
});

function checkRepo(i){
	if (i >= reposToCheck.length){return;}
  	var repo = reposToCheck[i];
	console.log("Checking "+repo.owner+"/"+repo.repo);
		
	github.repos.getContent({
		user: repo.owner,
		repo: repo.repo,
		path: repo.path
	},function(err,res){
		if (err != null){console.log(err); return;}
		console.log("\tsha:", res.sha);
		if (res.sha != expectedSha){
			console.log("\tattempting to sync")
			github.repos.updateFile({
				user: repo.owner,
				repo: repo.repo,
				path: repo.path,
				message: "syncing tests.json from schyntax/schyntax",
				content: expectedContent,
				sha: res.sha
			}, function(err){
				if (err != null){console.log("\t",err);return;}
				console.log("\tSuccess!")
				checkRepo(i+1)	
			})
		}else{
			console.log("\tnothing needed.")
			checkRepo(i+1)	
		}
	})
		
}