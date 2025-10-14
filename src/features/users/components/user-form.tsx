import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Eye, EyeOff, Save, X, Lock} from "lucide-react";
import {useThemeContext} from "@/components";
import {AuthorizationGroup, ExternalUser, User, UserFormData, Warehouse} from "../data/user";
import {userService} from "../data/user-service";
import {None} from "@/utils/axios-instance";
import {UserFormSkeleton} from "./UserFormSkeleton";

interface UserFormProps {
  user?: User | null;
  authorizationGroups: AuthorizationGroup[];
  warehouses: Warehouse[];
  onClose: (shouldReload?: boolean) => void;
}

const UserForm: React.FC<UserFormProps> = ({user, authorizationGroups, warehouses, onClose}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [externalUsers, setExternalUsers] = useState<ExternalUser[]>([]);

  const form = useForm<UserFormData>({
    defaultValues: {
      fullName: user?.fullName || "",
      password: "",
      email: user?.email,
      position: user?.position || "",
      superUser: user?.superUser || false,
      warehouses: user?.warehouses || [],
      externalId: user?.externalId || None,
      authorizationGroupId: user?.authorizationGroupId || None,
    },
  });

  const isEditing = !!user;

  useEffect(() => {
    loadExternalUsers();
  }, []);

  const loadExternalUsers = async () => {
    try {
      const data = await userService.getExternalUsers();
      setExternalUsers(data);
    } catch (error) {
      console.error("Failed to load external users:", error);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      // Validate that at least one warehouse is selected
      if (!data.superUser && data.warehouses.length === 0) {
        setError(t('atLeastOneWarehouseRequired'));
        return;
      }

      // For new users, password is required
      if (!isEditing && !data.password) {
        setError(t('passwordRequired'));
        return;
      }

      // Remove password from data if it's empty for updates
      const submitData = {...data};
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }

      if (isEditing) {
        await userService.update(user.id, submitData);
      } else {
        await userService.create(submitData);
      }

      onClose(true);
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} user: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  const handleWarehouseChange = (warehouseId: string, checked: boolean) => {
    const currentWarehouses = form.getValues("warehouses") ?? [];
    if (checked) {
      form.setValue("warehouses", [...currentWarehouses, warehouseId]);
    } else {
      form.setValue("warehouses", currentWarehouses.filter(id => id !== warehouseId));
    }
  };

  // Show skeleton while form is submitting
  if (isSubmitting) {
    return <UserFormSkeleton />;
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{
                    required: t('fullNameRequired'),
                    minLength: {
                      value: 2,
                      message: t('fullNameMinLength')
                    },
                    maxLength: {
                      value: 100,
                      message: t('fullNameMaxLength')
                    }
                  }}
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('fullName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enterFullName')} {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('invalidEmailFormat')
                    }
                  }}
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('enterEmail')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('position')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enterPosition')} {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('password')} {!isEditing && ' *'}
                    </CardTitle>
                    {isEditing && (
                      <CardDescription className="text-xs">
                        {t('leaveEmptyToKeepCurrent')}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="password"
                      rules={!isEditing ? {
                        required: t('passwordRequired'),
                        minLength: {
                          value: 6,
                          message: t('passwordMinLength')
                        }
                      } : {}}
                      render={({field}) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={isEditing ? t('enterNewPassword') : t('enterPassword')}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              {/*/!* Right Column *!/*/}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="authorizationGroupId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('authorizationGroup')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectAuthorizationGroup')}/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={None}>{t('none')}</SelectItem>
                          {authorizationGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('warehouses')} *</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {warehouses.map(warehouse => (
                      <div key={warehouse.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`warehouse-${warehouse.id}`}
                          checked={form.watch("warehouses")?.includes(warehouse.id)}
                          onCheckedChange={(checked) => handleWarehouseChange(warehouse.id, checked as boolean)}
                        />
                        <label htmlFor={`warehouse-${warehouse.id}`} className="text-sm">
                          {warehouse.name}
                          {warehouse.enableBinLocations && (
                            <span className="text-xs text-gray-500 ml-1">({t('binLocations')})</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="superUser"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('superUser')}</FormLabel>
                        <p className="text-sm text-gray-500">
                          {t('superUserDescription')}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalId"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('externalUser')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectExternalUser')}/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={None}>{t('none')}</SelectItem>
                          {externalUsers.map(extUser => (
                            <SelectItem key={extUser.id} value={extUser.id}>
                              {extUser.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2"/>
                {isSubmitting ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2"/>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UserForm;