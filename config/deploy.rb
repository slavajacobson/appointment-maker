require "rvm/capistrano"
require "bundler/capistrano"

set :default_environment, {

'PATH' => "$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH"
}

server "198.98.52.43", :web, :app, :db, primary: true
 
set :application, "irinas_salon"
set :user, "deployer"
set :deploy_to, "/home/#{user}/apps/#{application}"
set :deploy_via, :remote_cache
set :use_sudo, false
#set :port, "3030"
 
set :scm, "git"
set :repository, "git@bitbucket.org:slavajacobson/irinas-salon.git"
set :branch, "master"
set :dbname, "irinas_salon"
 
set :shared_children, shared_children + %w{public/uploads}

default_run_options[:pty] = true
ssh_options[:keys] = %w('~\.ssh\id_rsa.pub')
ssh_options[:forward_agent] = true
 
after "deploy", "deploy:cleanup" # keep only the last 5 releases
after "deploy:update_code", "deploy:migrate"

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn server"
    task command, roles: :app, except: {no_release: true} do
      run "/etc/init.d/unicorn_#{application} #{command}"
    end
  end
 

  task :setup_config, roles: :app do
    sudo "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}"
    sudo "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}"
    run "mkdir -p #{shared_path}/config"
    put File.read("config/database.example.yml"), "#{shared_path}/config/database.yml"
    puts "Now edit the config files in #{shared_path}."
  end
  after "deploy:setup", "deploy:setup_config"
 
  desc "reload the database with seed data"
  task :seed do
    run "cd #{current_path}; bundle exec rake db:seed RAILS_ENV=#{rails_env}"
  end

  task :symlink_config, roles: :app do
    run "ln -nfs #{shared_path}/config/database.yml #{release_path}/config/database.yml"
  end
  after "deploy:finalize_update", "deploy:symlink_config"
 
  desc "Make sure local git is in sync with remote."
  task :check_revision, roles: :web do
    unless `git rev-parse HEAD` == `git rev-parse master`
      puts "WARNING: HEAD is not the same as master"
      puts "Run `git push` to sync changes."
      exit
    end
  end
  before "deploy", "deploy:check_revision"


  after 'deploy:update_code' do
    run "cd #{release_path}; RAILS_ENV=production rake assets:precompile"
  end
end

namespace :rails do
  desc "Remote console"
  task :console, :roles => :app do
    run_interactively "bundle exec rails console #{rails_env}"
  end

  desc "Remote dbconsole"
  task :dbconsole, :roles => :app do
    run_interactively "bundle exec rails dbconsole #{rails_env}"
  end
end

def run_interactively(command, server=nil)
  server ||= find_servers_for_task(current_task).first
  exec %Q(ssh -l #{user} #{server.host} -t 'source ~/.profile && rails c #{rails_env}')
end

namespace :db do
  task :seed do
    run "cd #{current_path} && bundle exec rake db:seed RAILS_ENV=#{rails_env}"
  end
  task :reset do
    run 'echo "SELECT pg_terminate_backend(procpid) FROM pg_stat_activity WHERE datname=\'#{dbname}\';" | psql -U postgres'



    run "cd #{current_path} && bundle exec rake db:migrate VERSION=0 RAILS_ENV=#{rails_env}"
    run "cd #{current_path} && bundle exec rake db:migrate RAILS_ENV=#{rails_env}"
    run "cd #{current_path} && bundle exec rake db:seed RAILS_ENV=#{rails_env}"
  end

  task :clear do
    run 'echo "SELECT pg_terminate_backend(procpid) FROM pg_stat_activity WHERE datname=\'#{dbname}\';" | psql -U postgres'



    run "cd #{current_path} && bundle exec rake db:migrate VERSION=0 RAILS_ENV=#{rails_env}"
    run "cd #{current_path} && bundle exec rake db:migrate RAILS_ENV=#{rails_env}"
  end



end
