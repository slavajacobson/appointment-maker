root = "/home/deployer/apps/irinas_salon/current"
working_directory root
pid "#{root}/tmp/pids/unicorn.pid"
stderr_path "#{root}/log/unicorn.log"
stdout_path "#{root}/log/unicorn.log"

listen "/tmp/unicorn.irinas_salon.sock"
worker_processes 2
timeout 30
