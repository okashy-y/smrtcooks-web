# SMRTCOOKS Static (No database, no backend)

Designed for locked networks where DB providers and ingestion pipelines are blocked.

- Verified sources live in `public/data/verified_docs.json`
- The site loads that file in the browser and answers only from it
- Admin page lets you edit JSON and download a replacement file

Update flow (no terminal):
1) Open /admin
2) Edit JSON
3) Download verified_docs.json
4) Upload it to GitHub at public/data/verified_docs.json
5) Commit and redeploy

Deployment:
- Best: GitHub Pages with a GitHub Actions build, if Actions is allowed
- Otherwise: any host that can build Next.js static export
