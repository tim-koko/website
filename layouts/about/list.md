{{- partial "llm/frontmatter.md" . }}
# {{ .Title }}
{{ with .Params.about }}
## {{ .title }}

{{ .text | plainify | htmlUnescape | strings.TrimSpace }}
{{ range .persons }}
- {{ .name }}, {{ .title }}{{ with .author }}{{ with site.GetPage (printf "/authors/%s" .) }}{{ with .OutputFormats.Get "markdown" }} ([{{ i18n "llmsProfile" }}]({{ .Permalink }})){{ end }}{{ end }}{{ end }}
{{- end }}
{{ end }}
{{- with .Params.values }}
## {{ .title }}

{{ .text | plainify | htmlUnescape | strings.TrimSpace }}
{{ range .values }}
- **{{ .title }}:** {{ .text | plainify | htmlUnescape | strings.TrimSpace }}
{{- end }}
{{ end }}
{{- range slice .Params.partner .Params.community }}
{{- if and . .enabled }}
## {{ .title }}

{{ .text | plainify | htmlUnescape | strings.TrimSpace }}
{{ range .item }}
- [{{ .title }}]({{ .link }})
{{- end }}
{{ end }}
{{- end }}
{{ partial "llm/content.md" . }}
