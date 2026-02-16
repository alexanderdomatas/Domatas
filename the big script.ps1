
# Step 8: Push the public folder to the hostinger branch using subtree split and force push

$TargetRemoteBranch = "deploy"

$TempSplitBranch = "temp-split-branch"



Write-Host "Deploying to GitHub Deploy..."



# Check if the temporary branch exists and delete it

$branchExists = git branch --list "$TempSplitBranch"

if ($branchExists) {

    git branch -D $TempSplitBranch

}



# Perform subtree split

try {

    git subtree split --prefix public -b $TempSplitBranch

}

catch {

    Write-Error "Subtree split failed."

    exit 1

}



# Push to hostinger branch with force

try {

    git push origin "$($TempSplitBranch):$($TargetRemoteBranch)" --force

}

catch {

    Write-Error "Failed to push to hostinger branch."

    git branch -D $TempSplitBranch

    exit 1

}



# Delete the temporary branch

git branch -D $TempSplitBranch


Write-Host "All done! Site synced, processed, committed, built, and deployed."
