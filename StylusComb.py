import commands, subprocess
import sublime, sublime_plugin

class StylusCombCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		sublime.status_message('Successfully started')
		self.save()
		self.prettify(edit)
		sublime.status_message('Successfully finished')

	def save(self):
		self.view.run_command("save")

	def prettify(self, edit):
		scriptPath = sublime.packages_path() + "\\StylusComb\\scripts\\run.js"
		settings = ' '.join([
			"indent:'	'"
		])
		cmd = ["node",scriptPath,self.view.file_name(),settings]

		if sublime.platform()=='windows':
			p = subprocess.Popen(cmd,shell=True,stdout=subprocess.PIPE)
			html = p.communicate()[0]
		else:
			html = commands.getoutput('"'+'" "'.join(cmd)+'"')

		if len(html) > 0:
			self.view.replace(edit, sublime.Region(0, self.view.size()), html.decode('utf-8')[:-1])
			sublime.set_timeout(self.save, 100)
		else:
			self.view.replace(edit, sublime.Region(0, self.view.size()), html.decode('utf-8')[:-1])
			sublime.error_message(str(len(html)))