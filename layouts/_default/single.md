{{- partial "llm/frontmatter.md" . }}
# {{ .Title }}
{{ with .Params.lead }}
> {{ . | plainify | htmlUnescape }}
{{ end }}
{{- with .Params.abstract }}
{{ .text | plainify | htmlUnescape }}
{{ range .list }}
- {{ . }}
{{- end }}
{{ end }}
{{ partial "llm/content.md" . }}
